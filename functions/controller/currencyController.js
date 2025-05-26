const { db } = require('../config/firebase');
const currencyCollection = db.collection('Currency');
const { transferFirestoreWithNestedReferences } = require('../utils/utils');

const currencyController = {
    async add(req, res) {
        const { Country, Exrate, Name } = req.body;
        try {
            const currencyInfo = {
                Country, Exrate, Name
            };
            //add validation here;

            await currencyCollection.add(currencyInfo);

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
            const currency = (await currencyCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: currency
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Country, Exrate, Name } = req.body;
        try {
            const { id } = req.params;
            const newCurrencyInfo = {
                Country, Exrate, Name
            };
            await currencyCollection.doc(id).update(newCurrencyInfo);
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
            await currencyCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async getAll(req, res) {
        try {
            const allCurrency = await currencyCollection.get();
            const cookedAllCurrency = await transferFirestoreWithNestedReferences(allCurrency.docs);
            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: cookedAllCurrency
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.currencyController = currencyController;