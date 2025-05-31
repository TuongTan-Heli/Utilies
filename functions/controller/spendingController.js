const { db, Timestamp } = require('../config/firebase');
const { transferFirestoreWithNestedReferences,validateRes } = require('../utils/utils');


const spendingCollection = db.collection('Spending');
const UserCollection = db.collection('User');
const CurrencyCollection = db.collection('Currency');

const spendingController = {
    async add(req, res) {
        const { UserId, Amount, Type, CurrencyId, Note, Special, Day } = req.body;
        const User = await UserCollection.doc(UserId);
        const Currency = await CurrencyCollection.doc(CurrencyId);

        try {
            const spendingInfo = {
                User, Amount, Type, Share: null, Currency, Date: Timestamp.fromDate(new Date(Day)), Note, Special
            };
            //add validation here;

            await spendingCollection.add(spendingInfo);

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
            const spending = (await spendingCollection.doc(id).get()).data();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: spending
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async getSpendingInPeriod(req, res) {
        try {
            const { id } = req.params;
            const { From, To } = req.body;
            const user = await UserCollection.doc(id);
            if (user) {
                const spendings = await spendingCollection
                    .where("Date", ">=", Timestamp.fromDate(new Date(From)))
                    .where("Date", "<=", Timestamp.fromDate(new Date(To)))
                    .where("User", "==", user)
                    .get();

                const cookedSpendings = await transferFirestoreWithNestedReferences(spendings.docs);
                res.status(200).send(validateRes({
                    status: 'Success',
                    message: 'Success',
                    data: cookedSpendings
                }));
            }
            else {
                res.status(404);
            }


        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Type, Amount, Currency, Date, Note, Special } = req.body;
        try {
            const newSpendingInfo = {
                Type, Amount, Share: null, Currency, Date, Note, Special
            };
            const { id } = req.params;
            await spendingCollection.doc(id).update(newSpendingInfo);
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
            await spendingCollection.doc(id).delete();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.spendingController = spendingController;