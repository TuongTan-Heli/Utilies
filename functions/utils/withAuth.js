const { db } = require('../config/firebase');
const { loginSessionController } = require('../controller/loginSessionController');
const { apiKeyController } = require('../controller/apiKeyController');
const apiKeyCollection = db.collection('ApiKey');

async function withAuth(req, res) {
    const { session } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!session) {
        return { error: res.status(401).json({ message: "Missing session token" }) };
    }

    /* =========================
       1️⃣ SESSION VALIDATION
    ========================= */
    const sessionResult =
        await loginSessionController.getDataFromSessionToken(session);

    if (!sessionResult?.success || sessionResult.isExpired) {
        return {
            error: res.status(401).json({
                message: "Session expired or invalid",
            }),
        };
    }

    const userId = sessionResult.userData.id;
    const userRef = db.collection("User").doc(userId);

    /* =========================
       2️⃣ API KEY CHECK
    ========================= */
    const apikeyDocs = await apiKeyCollection
        .where("ApiKey", "==", apiKey)
        .where("User", "==", userRef)
        .limit(1)
        .get();

    const apiKeyResult =
        await apiKeyController.checkExpireOrGenerateApi(
            apikeyDocs.docs[0],
            userRef
        );

    const newApiKey = { ...apiKeyResult };
    delete newApiKey.User;

    return {
        userRef,
        userData: sessionResult.userData,
        apiKey: newApiKey,
        apiKeyRefreshed: apiKeyResult.isNew === true, // optional flag
    };
}

module.exports = { withAuth };
