const { db } = require('../config/firebase');
const loginSessionCollection = db.collection('loginSession');
const userCollection = db.collection('User');
let sessionSnapshot = {};
const { v4: uuidv4 } = require('uuid');
const { transferFirestoreWithNestedReferences, validateRes } = require('../utils/utils');

const loginSessionController = {

    async checkTokenExpire(sessionDoc) {
        if (!sessionDoc.exists) return true;
        const expireDate = sessionDoc.data().Expire.toDate?.() || new Date(sessionDoc.data().Expire);
        return expireDate < new Date();
    },

    async getDataFromSessionToken(sessionToken) {
        try {
            const snapshot = await this.getSessionTokenSnapshot(sessionToken);
            if (snapshot.empty) {
                return { success: false, reason: "not_found" };
            }

            const sessionDoc = snapshot.docs[0];
            const isExpired = await this.checkTokenExpire(sessionDoc);
            if (isExpired) {
                return { success: false, reason: "expired" };
            }

            const sessionInfo = await transferFirestoreWithNestedReferences(sessionDoc);
            const userRef = sessionInfo.User;
            const userSnap = await userCollection.doc(userRef.id).get();

            if (!userSnap.exists) {
                return { success: false, reason: "user_not_found" };
            }

            const userData = await transferFirestoreWithNestedReferences(userSnap);
            return { success: true, sessionInfo, userData, userId: userRef.id };

        } catch (err) {
            return { success: false, reason: "error", error: err.message };
        }
    },

    async generateNewSessionToken(userDoc) {
        const userRef = userDoc.ref;
        const existingSession = await this.getSessionTokenSnapshotByUser(userRef);
        const newToken = uuidv4();

        const sessionData = {
            User: userRef,
            SessionToken: newToken,
            Expire: new Date().setDate(new Date().getDate() + 30),
        };

        if (!existingSession.empty) {
            await loginSessionCollection.doc(existingSession.docs[0].id).update(sessionData);
        } else {
            await loginSessionCollection.add(sessionData);
        }

        return { SessionToken: newToken, Expire: sessionData.Expire };
    },

    async getSessionTokenSnapshot(sessionToken) {
        return await loginSessionCollection
            .where("SessionToken", "==", sessionToken)
            .limit(1)
            .get();
    },

    async getSessionTokenSnapshotByUser(userRef) {
        return await loginSessionCollection
            .where("User", "==", userRef)
            .limit(1)
            .get();
    },
}

module.exports.loginSessionController = loginSessionController;