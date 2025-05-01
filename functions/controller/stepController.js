const { db } = require('../config/firebase');
const stepCollection = db.collection('Step');
module.exports.stepController = {

    async add(req, res) {
        const { Action, Ingredients, Note, Recipe } = req.body;
        try {
            const stepInfo = {
                Action, Ingredients, Note, Recipe
            };
            //add validation here;

            await stepCollection.add(stepInfo);

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
            const step = (await stepCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: step
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Action, Ingredients, Note, Recipe } = req.body;
        try {
            const newStepInfo = {
                Action, Ingredients, Note, Recipe
            };
            const { id } = req.params;
            await stepCollection.doc(id).update(newStepInfo);
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
            await stepCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}