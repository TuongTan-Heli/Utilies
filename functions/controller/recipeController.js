const { db } = require('../config/firebase');
const recipeCollection = db.collection('Recipe');
module.exports.recipeController = {

    async add(req, res) {
        const { Name, Description, Image, Ingredients, Steps, Share, User } = req.body;
        try {
            const recipeInfo = {
                Name, Description, Image, Ingredients, Steps, Share, User
            };
            //add validation here;

            await recipeCollection.add(recipeInfo);

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
            const recipe = (await recipeCollection.doc(id).get()).data();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
                data: recipe
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Name, Description, Image, Ingredients, Steps, Share, User } = req.body;
        try {
            const newRecipeInfo = {
                Name, Description, Image, Ingredients, Steps, Share, User
            };
            const { id } = req.params;
            await recipeCollection.doc(id).update(newRecipeInfo);
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
            await recipeCollection.doc(id).delete();

            res.status(200).send({
                status: 'Success',
                message: 'Success',
            });
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}