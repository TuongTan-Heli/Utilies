const { db } = require('../config/firebase');
const loginSessionCollection = db.collection('loginSession');
const userCollection = db.collection('User');
let sessionSnapshot = {};
const { v4: uuidv4 } = require('uuid');
const { transferFirestoreWithNestedReferences,validateRes } = require('../utils/utils');

const loginSessionController = {
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

        sessionInfo = {};
        if (sessionSnapshot.length == 0) {
            return {}; // No session found
        }
        const userId = sessionSnapshot[0].data().User.id;
        if (isTokenExpired) {
            return 'Token expired';
        }
        else {
            sessionInfo = await transferFirestoreWithNestedReferences(sessionSnapshot[0]);
        }
        userData = await transferFirestoreWithNestedReferences((((await userCollection.doc(userId).get()))));
        return { sessionInfo, userId };
    },

    async generateNewSessionToken(user) {
        sessionSnapshot = (await this.getSessionTokenSnapshotByUser(user.ref)).docs;

        const sessionTokenInfo = {
            // User: userCollection.doc(user.id),
            SessionToken: uuidv4(),
            Expire: new Date().setDate(new Date().getDate() + 30),
            data() {
                return {
                    User: this.User,
                    SessionToken: this.SessionToken,
                    Expire: this.Expire,
                };
            }
        }
        sessionSnapshot.length != 0 ?
            await loginSessionCollection.doc(sessionSnapshot[0].id).update(sessionTokenInfo.data()) :
            await loginSessionCollection.add(sessionTokenInfo.data())

        return await transferFirestoreWithNestedReferences(sessionTokenInfo);
    },

    async getSessionTokenSnapshot(sessionToken) {
        return await loginSessionCollection
            .where("SessionToken", "==", sessionToken)
            .limit(1)
            .get();
    },

    async getSessionTokenSnapshotByUser(user) {
        return await loginSessionCollection
            .where("User", "==", user)
            .limit(1)
            .get();
    }
}

module.exports.loginSessionController = loginSessionController;