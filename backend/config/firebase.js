const admin = require('firebase-admin');
const path = require('path');

// download your serviceAccountKey.json from Firebase console
// Firebase Console → Project Settings → Service Accounts → Generate new private key
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;