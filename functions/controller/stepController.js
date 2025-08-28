const { db } = require('../config/firebase');
const stepCollection = db.collection('Step');
const { validateRes } = require('../utils/utils');

const stepController = {
    async add(step) {
        const { Action, Ingredients, Note, Recipe } = step;
        try {
            const stepInfo = {
                Action, Ingredients, Note, Recipe
            };
            //add validation here;

            return await stepCollection.add(stepInfo);
        } catch (error) {
            throw new Error(`Failed to add step: ${error.message}`);
        }
    },

    async get(req, res) {
        try {
            const { id } = req.params;
            const step = (await stepCollection.doc(id).get()).data();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: step
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update({ Action, Ingredients, Note, Recipe, id }) {
        // const { Action, Ingredients, Note, Recipe } = req.body;
        try {
            const newStepInfo = {
                Action, Ingredients, Note, Recipe
            };
            // const { id } = req.params;
            await stepCollection.doc(id).update(newStepInfo);
            // res.status(200).send(validateRes({
            //     status: 'Success',
            //     message: 'Success'
            // }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async delete(stepId) {
        try {
            // const { id } = req.params;
            await stepCollection.doc(stepId).delete();
        } catch (error) {
            throw new Error(`Failed to delete step: ${error.message}`);
        }
    },
}

module.exports.stepController = stepController;