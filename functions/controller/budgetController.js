const { db, Timestamp } = require('../config/firebase');
const budgetCollection = db.collection('Budget');
const userCollection = db.collection('User');
const currencyCollection = db.collection('Currency');
const { validateRes, transferFirestoreWithNestedReferences } = require('../utils/utils');


const budgetController = {
    async add(req, res) {
        const { Amount, CurrencyId, To, UserId } = req.body;
        const User = userCollection.doc(UserId);
        const Currency = currencyCollection.doc(CurrencyId);
        try {
            const budgetInfo = {
                Amount, Currency, To: new Date(To), Share: null, User
            };
            //add validation here;

            await budgetCollection.add(budgetInfo);

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
            const budget = (await budgetCollection.doc(id).get()).data();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: budget
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async getLatest(req, res) {
        try {
            const { id } = req.params;
            const user = await userCollection.doc(id);
            const LatestBudget = await budgetCollection
                .where("User", "==", user)
                .where('To', ">=", Timestamp.fromDate(new Date()))
                .orderBy('To', 'asc')
                .limit(1)
                .get()
            if (LatestBudget.docs.length != 0) {
                res.status(200).send(validateRes({
                    status: 'Success',
                    message: 'Success',
                    data: await transferFirestoreWithNestedReferences(LatestBudget.docs[0])
                }))
            }
            else {
                res.status(404).json("No upcoming budget")
            }

        }

        catch (error) {
            res.status(500).json(error.message);
        }

    },

    async getAll(req, res) {
        try {
            const { id } = req.params;
            const user = await userCollection.doc(id);
            const budget = await budgetCollection.where("User", "==", user)
                .orderBy('To', 'desc')
                .get();
            const cookedBudget = await transferFirestoreWithNestedReferences(budget.docs);
            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: cookedBudget
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Amount, CurrencyId, To } = req.body;
        const Currency = currencyCollection.doc(CurrencyId);

        try {
            const newBudgetInfo = {
                Amount, Currency, To: Timestamp.fromDate(new Date(To)), Share: null
            };
            const { id } = req.params;
            await budgetCollection.doc(id).update(newBudgetInfo);
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
            await budgetCollection.doc(id).delete();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.budgetController = budgetController;