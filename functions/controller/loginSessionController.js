const { db } = require('../config/firebase');
const loginSessionCollection = db.collection('loginSession');
const userCollection = db.collection('User');
let sessionSnapshot = {};
const { v4: uuidv4 } = require('uuid');

module.exports.loginSessionController = {

    async checkTokenExpire(sessionToken) {
        sessionSnapshot = (await this.getSessionTokenSnapshot(sessionToken)).docs;

        if (sessionSnapshot.length == 0) {
            return true; // No session found
        }

        const sessionData = sessionSnapshot[0].data();
        const expireDate = sessionData.Expire.toDate?.() || new Date(sessionData.Expire);

        return expireDate < new Date();
    },

    async getDataFromSessionToken(sessionToken) {
        const isTokenExpired = await this.checkTokenExpire(sessionToken);
        sessionSnapshot = (await this.getSessionTokenSnapshot(sessionToken)).docs;
        let userId = "";
        sessionInfo = {};
        if (sessionSnapshot.length == 0) {
            return {}; // No session found
        }

        if (isTokenExpired) {
            sessionTokenId = sessionSnapshot[0].id;
            userId = sessionSnapshot[0].data().User;
            sessionInfo = {
                User: userId,
                SessionToken: uuidv4(),
                Expire: new Date().setDate(new Date().getDate() + 30)
            }
            loginSessionCollection.docs(sessionTokenId).update(sessionInfo);
        }
        else {
            userId = sessionSnapshot[0].data().User;
            sessionInfo = sessionSnapshot[0].data();
        }
        userData = (await userCollection.doc(userId).get()).data();
        return { userData, sessionInfo };
    },
    async generateNewSessionToken(userId) {
        sessionSnapshot = (await this.getSessionTokenSnapshotByUser(userId)).docs;

        const sessionTokenInfo = {
            User: userId,
            SessionToken: uuidv4(),
            Expire: new Date().setDate(new Date().getDate() + 30)
        }
        sessionSnapshot.length != 0 ?  
        await loginSessionCollection.doc(sessionSnapshot[0].id).update(sessionTokenInfo):
        await loginSessionCollection.add(sessionTokenInfo) 

        return sessionTokenInfo;
    },

    async getSessionTokenSnapshot(sessionToken) {
        return await loginSessionCollection
            .where("SessionToken", "==", sessionToken)
            .limit(1)
            .get();
    },

    async getSessionTokenSnapshotByUser(userId) {
        return await loginSessionCollection
            .where("User", "==", userId)
            .limit(1)
            .get();
    }
}