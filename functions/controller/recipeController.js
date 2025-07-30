const { algoliasearch } = require('algoliasearch');
const { db } = require('../config/firebase');
const recipeCollection = db.collection('Recipe');
const { validateRes } = require('../utils/utils');

require('dotenv').config();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
const ALGOLIA_INDEX_NAME = "Recipe";

const recipeController = {

    async add(req, res) {
        const { Name, Description, Image, Ingredients, Steps, Share, User } = req.body;
        try {
            const recipeInfo = {
                Name, Description, Image, Ingredients, Steps, Share, User
            };
            //add validation here;

            await recipeCollection.add(recipeInfo);

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
            const recipe = (await recipeCollection.doc(id).get()).data();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: recipe
            }));
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
            await recipeCollection.doc(id).delete();

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async search(req, res) {
        const {key} = req.params;
        if (!key) {
            return res.status(400).send("Missing query param `q`");
        }

        try {
            const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
            const algoliaRes = await client.search({
                requests: [
                    {
                        indexName: ALGOLIA_INDEX_NAME,
                        query: key,
                    },
                ],
            });
            return res.status(200).json(algoliaRes.results[0]?.hits);
        } catch (err) {
            console.error("Search failed:", err);
            return res.status(500).send("Search failed");
        }
    }
}

module.exports.recipeController = recipeController;
