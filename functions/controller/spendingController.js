const { db } = require('../config/firebase');
const spendingCollection = db.collection('Spending');
module.exports.spendingController = {

    async add(req, res) {
        const { User, Type, Share, Currency, Date, Note, Special } = req.body;
        try {
            const spendingInfo = {
                User, Type, Share, Currency, Date, Note, Special
            };
            //add validation here;

            await spendingCollection.add(spendingInfo);

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
            const spending = (await spendingCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: spending
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { User, Type, Share, Currency, Date, Note, Special } = req.body;
        try {
            const newSpendingInfo = {
                User, Type, Share, Currency, Date, Note, Special
            };
            const { id } = req.params;
            await spendingCollection.doc(id).update(newSpendingInfo);
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
            await spendingCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}