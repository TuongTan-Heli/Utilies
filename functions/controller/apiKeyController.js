const { db, Timestamp } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const apiKeyCollection = db.collection('ApiKey');
const userCollection = db.collection('User');
let apiKeySnapshot = {};
const { transferFirestoreWithNestedReferences } = require('../utils/utils');

const apiKeyController = {
    async validateApiKey(req, res, next) {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            req.role = 'Basic';
            return next();
        }
        try {
            // Logic to check if the API key is valid
            const apiKeySnapshot = await apiKeyCollection
                .where('ApiKey', '==', apiKey)
                .limit(1)
                .get();

            if (apiKeySnapshot.empty) {
                return res.status(403).json({ message: 'Invalid API Key' });
            }
            //expect to check expire

            const apiKeyData = await apiKeyController.checkExpireOrGenerateApi(apiKeySnapshot.docs[0], null);

            const userId = apiKeyData.User.id;
            req.role = (await userCollection.doc(userId).get()).data().Role;

            return next();  // Proceed to the next middleware or route handler
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    async checkExpireOrGenerateApi(apiKeyInfo, userRef) {
        const now = new Date();

        // 🔹 Helper to generate a fresh API key object
        const generateApiKeyData = () => ({
            ApiKey: uuidv4(),
            Expire: Timestamp.fromDate(
                new Date(now.getTime() + 24 * 60 * 60 * 1000) // +1 day
            ),
            User: userRef,
        });

        // 🟢 CASE 1: API key already exists
        if (apiKeyInfo) {
            const data = apiKeyInfo.data();
            const expireDate = new Date(data.Expire.seconds * 1000);

            // ❌ expired → generate new
            if (expireDate < now) {
                const newData = generateApiKeyData();
                await apiKeyCollection.doc(apiKeyInfo.id).update(newData);

                return {
                    ...newData,
                    refreshed: true,
                };
            }

            // ✅ still valid → return existing
            return {
                ...data,
                refreshed: false,
            };
        }

        // 🟡 CASE 2: No API key passed → find by user
        const snapshot = await apiKeyCollection
            .where("User", "==", userRef)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            return {
                ...snapshot.docs[0].data(),
                refreshed: false,
            };
        }

        // 🔴 CASE 3: No API key at all → create new
        const newData = generateApiKeyData();
        await apiKeyCollection.add(newData);

        return {
            ...newData,
            refreshed: true,
        };
    },

    async getApiSnapshotByUser(user) {
        return await apiKeyCollection
            .where("User", "==", user)
            .limit(1)
            .get();
    }
}

module.exports.apiKeyController = apiKeyController;