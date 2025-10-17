const { db, Timestamp } = require('../config/firebase');
const remainingCollection = db.collection('Remaining');
const userCollection = db.collection('User');
const currencyCollection = db.collection('Currency');
const { validateRes, transferFirestoreWithNestedReferences } = require('../utils/utils');

const remainingController = {
    async add(req, res) {
        const { Amount, CurrencyId, UserId } = req.body;
        const User = userCollection.doc(UserId);
        const Currency = currencyCollection.doc(CurrencyId);

        try {
            const remainingInfo = {
                Amount, Currency, Date: new Date(), Share: null, User
            };
            //add validation here;

            await remainingCollection.add(remainingInfo);

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success'
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async get(req, res) {
        try {
            const { id } = req.params;
            const remaining = (await remainingCollection.doc(id).get()).data();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: remaining
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async getLatest(req, res) {
        try {
            const { id } = req.params;
            const user = await userCollection.doc(id);
            const LatestRemaining = await remainingCollection
                .where("User", "==", user)
                .where('Date', "<=", Timestamp.fromDate(new Date()))
                .orderBy('Date', 'desc')
                .limit(1)
                .get();

            if (LatestRemaining.docs.length != 0) {
                res.status(200).send(validateRes({
                    status: 'Success',
                    message: 'Success',
                    data: await transferFirestoreWithNestedReferences(LatestRemaining.docs[0])
                }));
            } else {
                res.status(200).send(validateRes({
                    status: 'Success',
                    message: 'Success',
                    data: "No remaining found"
                }));
            }

        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async getAll(req, res) {
        try {
            const { id } = req.params;
            const user = await userCollection.doc(id);
            const remaining = await remainingCollection.where("User", "==", user)
                .orderBy('Date', 'desc')
                .get();

            const cookedRemaining = await transferFirestoreWithNestedReferences(remaining.docs);
            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: cookedRemaining
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Amount, CurrencyId, Day } = req.body;
        const Currency = currencyCollection.doc(CurrencyId);

        try {
            const newRemainingInfo = {
                Amount, Currency, Date: Timestamp.fromDate(new Date(Day)), Share: null,
            };
            const { id } = req.params;
            await remainingCollection.doc(id).update(newRemainingInfo);
            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success'
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await remainingCollection.doc(id).delete();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.remainingController = remainingController;