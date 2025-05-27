const { db } = require('../config/firebase');
const budgetCollection = db.collection('Budget');
const userCollection = db.collection('User');
const currencyCollection = db.collection('Currency');

const budgetController = {
    async add(req, res) {
        const { Amount, CurrencyId, To, UserId} = req.body;
        const User = userCollection.doc(UserId);
        const Currency = currencyCollection.doc(CurrencyId);
        try {
            const budgetInfo = {
                Amount, Currency, From: new Date(), To, Share: null, User
            };
            //add validation here;

            await budgetCollection.add(budgetInfo);

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
            const budget = (await budgetCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: budget
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Amount, Currency, From, To, Share, User, id } = req.body;
        try {
            const newBudgetInfo = {
                Amount, Currency, From, To, Share, User
            };
            const { id } = req.params;
            await budgetCollection.doc(id).update(newBudgetInfo);
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
            await budgetCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.budgetController = budgetController;