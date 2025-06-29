import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
    // initializeApp() will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // or Application Default Credentials if available in a Google Cloud environment.
    admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
