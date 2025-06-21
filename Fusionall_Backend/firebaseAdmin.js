const admin = require('firebase-admin');

// Try to get service account from environment variable first, then fall back to file
let serviceAccount;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use environment variable if set
    serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  } else {
    // Fall back to local file
    serviceAccount = require('./serviceAccountKey.json');
  }
} catch (error) {
  console.error('Error loading service account:', error.message);
  console.error('Please ensure you have either:');
  console.error('1. A valid serviceAccountKey.json file in the backend directory');
  console.error('2. GOOGLE_APPLICATION_CREDENTIALS environment variable set');
  process.exit(1);
}

// Initialize Firebase Admin with error handling
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fusionall360.firebaseio.com"
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.error('Please check your service account credentials and Firebase project configuration');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// Test the connection
db.collection('test').limit(1).get()
  .then(() => {
    console.log('✅ Firestore connection successful');
  })
  .catch((error) => {
    console.error('❌ Firestore connection failed:', error.message);
    console.error('Please check your Firebase project configuration and service account permissions');
  });

module.exports = { admin, db, auth };

