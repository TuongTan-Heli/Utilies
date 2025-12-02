const { algoliasearch } = require('algoliasearch');
const { db } = require('../config/firebase');
const { transferFirestoreWithNestedReferences, validateRes } = require('../utils/utils');
const recipeCollection = db.collection('Recipe');
const stepCollection = db.collection('Step');
const { stepController } = require('./stepController');
const userCollection = db.collection('User');


require('dotenv').config();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
const ALGOLIA_INDEX_NAME = "Recipe";
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

const recipeController = {

    async add(req, res) {
        const { Name, Description, Image, Ingredients, Steps, Share, UserId } = req.body;
        try {

            const User = await userCollection.doc(UserId);
            const recipeInfo = {
                Name, Description, Image, Ingredients, Share: null, User
            };
            //add validation here;

            const recipeRef = await recipeCollection.add(recipeInfo);

            const stepPromises = Steps.map(async (step) => {
                step.Recipe = recipeRef;
                const stepRef = await stepController.add(step);
                return stepRef;
            });

            const stepRefs = await Promise.all(stepPromises);
            // await Promise.all(stepPromises);
            recipeRef.set(
                { Steps: stepRefs },
                { merge: true } // <-- merges with existing fields, doesn't overwrite whole doc
            );

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
            const recipe = (await recipeCollection.doc(id).get());

            const recipeData = recipe.data();

            if (recipeData.Steps?.length) {
                const stepSnapshots = await Promise.all(recipeData.Steps.map(ref => ref.get()));

                recipeData.Steps = stepSnapshots
                    .filter(snap => snap.exists)
                    .map(snap => {
                        const { Recipe, ...rest } = snap.data(); // remove Recipe from step to avoid recursion
                        return { id: snap.id, ...rest };
                    });
            }

            const cookedRecipe = await transferFirestoreWithNestedReferences({
                id: recipe.id,
                data: () => recipeData
            });

            res.status(200).send(validateRes({
                status: 'Success',
                message: 'Success',
                data: cookedRecipe
            }));
        } catch (error) {
            res.status(500).json(error.message);
        }
    },

    async update(req, res) {
        const { Name, Description, Image, Ingredients, Steps, Share, User } = req.body;
        const { id } = req.params;

        try {
            const recipeRef = recipeCollection.doc(id);
            const recipeSnap = await recipeRef.get();
            const oldSteps = recipeSnap.data()?.Steps ?? [];

            // Extract step IDs
            const oldStepIds = oldSteps.map(s => s.id);
            const newStepIds = Steps.filter(s => s.id).map(s => s.id);

            // Classify changes
            const stepsToDelete = oldStepIds.filter(id => !newStepIds.includes(id));
            const stepsToUpdate = Steps.filter(s => s.id && oldStepIds.includes(s.id));
            const stepsToAdd = Steps.filter(s => !s.id);

            // Run changes in parallel
            await Promise.all([
                ...stepsToDelete.map(id => stepController.delete(id)),

                ...stepsToUpdate.map(({ id: stepId, Recipe, ...fields }) =>
                    stepCollection.doc(stepId).update(fields)
                ),

                ...stepsToAdd.map(step =>
                    stepController.add({ ...step, Recipe: recipeRef })
                )
            ]);

            // Re-fetch steps for updated recipe
            const newStepsSnap = await stepCollection.where("Recipe", "==", recipeRef).get();
            const newStepsRefs = newStepsSnap.docs.map(doc => doc.ref);

            // Update recipe with latest info
            await recipeRef.update({
                Name,
                Description,
                Image,
                Ingredients,
                Steps: newStepsRefs
            });

            res.status(200).send(validateRes({
                status: "Success",
                message: "Recipe updated successfully"
            }));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;

            const recipeData = (await recipeCollection.doc(id).get()).data();

            const stepDeleteTasks = recipeData.Steps.map(step => stepController.delete(step.id));

            await Promise.all(stepDeleteTasks);

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
        const { key, userId } = req.body;
        if (!key || !userId) {
            return res.status(400).send("Missing query param `q`");
        }

        try {
            const algoliaRes = await client.search({
                requests: [
                    {
                        indexName: ALGOLIA_INDEX_NAME,
                        query: key,
                        filters: `User:User/${userId}`
                    },
                ],
            });
            return res.status(200).json(algoliaRes.results[0]?.hits);
        } catch (err) {
            console.error("Search failed:", err);
            return res.status(500).send("Search failed");
        }
    },

    async getAll(req, res) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send("User id not found");
        }
        try {
            const algoliaRes = await client.search({
                requests: [
                    {
                        indexName: ALGOLIA_INDEX_NAME,
                        query: '',
                        filters: `User:User/${id}`
                    },
                ],
            });
            return res.status(200).json(algoliaRes.results[0]?.hits);
        } catch (error) {
            res.status(500).json(error.message);
        }
    },
}

module.exports.recipeController = recipeController;
