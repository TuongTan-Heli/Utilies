const { db } = require('../config/firebase');
const remainingCollection = db.collection('Remaining');
const userCollection = db.collection('User');
const currencyCollection = db.collection('Currency');

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

            res.status(200).send({
                status: 'Success',
                message: 'Success'
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async get(req, res) {
        try {
            const { id } = req.params;
            const remaining = (await remainingCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: remaining
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Amount, Currency, Date, Share, User } = req.body;
        try {
            const newRemainingInfo = {
                Amount, Currency, Date, Share, User
            };
            const { id } = req.params;
            await remainingCollection.doc(id).update(newRemainingInfo);
            res.status(200).send({
                status: 'Success',
                message: 'Success'
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await remainingCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.remainingController = remainingController;