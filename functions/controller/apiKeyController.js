const { db } = require('../config/firebase');
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

    async checkExpireOrGenerateApi(apiKeyInfo, user) {
        let newApiKeyInfo = {
            ApiKey: uuidv4(),
            Expire: new Date().setDate(new Date().getDate() + 1),
            User: null,
            data() {
                return {
                    ApiKey: this.ApiKey,
                    Expire: this.Expire,
                    User: this.User
                }

            }
        }
        if (!apiKeyInfo) {
            apiKeySnapshot = (await apiKeyController.getApiSnapshotByUser(user)).docs;
            newApiKeyInfo.User = userCollection.doc(user.id);
            apiKeySnapshot.length != 0 ?
                await apiKeyCollection.doc(apiKeySnapshot[0].id).update(newApiKeyInfo.data()) :
                await apiKeyCollection.add(newApiKeyInfo)
        }
        else {
            newApiKeyInfo.User = apiKeyInfo.data().User;
            const expireDate = apiKeyInfo.data().Expire.toDate?.() || new Date(apiKeyInfo.data().Expire);
            const apiKeyId = apiKeyInfo.id;
            if (expireDate < new Date()) {
                await apiKeyCollection.doc(apiKeyId).update(newApiKeyInfo.data());
            }
        }
        return await transferFirestoreWithNestedReferences(newApiKeyInfo);
    },

    async getApiSnapshotByUser(user) {
        return await apiKeyCollection
            .where("User", "==", user)
            .limit(1)
            .get();
    }
}

module.exports.apiKeyController = apiKeyController;