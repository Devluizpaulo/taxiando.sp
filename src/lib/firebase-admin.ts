import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let app: admin.app.App;

// This logic prevents re-initializing the app in hot-reload environments
if (admin.apps.length === 0) {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        throw new Error('Firebase Admin SDK credentials are not set. Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are defined in your environment variables.');
    }

    const serviceAccount = {
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // The private key must have newlines escaped
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
} else {
    app = admin.app();
}

const adminDB = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminAuth, adminDB, adminStorage, Timestamp };
