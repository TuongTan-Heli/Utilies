const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { getFirestore } = require('firebase-admin/firestore');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
const db = getFirestore('utilies');
db.settings({ignoreUndefinedProperties: true});
module.exports = {admin, db};
