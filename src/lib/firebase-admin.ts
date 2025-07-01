
'use server';

import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let app: admin.app.App;

// This logic prevents re-initializing the app in hot-reload environments
if (admin.apps.length === 0) {
    let serviceAccount;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
        try {
            serviceAccount = JSON.parse(serviceAccountJson);
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e);
            throw new Error(`
CRITICAL: Failed to parse the 'FIREBASE_SERVICE_ACCOUNT_JSON' environment variable.
Please ensure it is a valid, unescaped JSON string copied directly from your service account file.
This is a configuration error, not a bug in the code.
            `);
        }
    } else {
         throw new Error(`
CRITICAL: Firebase Admin SDK credentials are not set. This is the final configuration step.

To fix this:
1. Go to your Firebase Project Settings > Service Accounts tab.
2. Click "Generate new private key" to download a JSON file.
3. Create an environment variable named 'FIREBASE_SERVICE_ACCOUNT_JSON'.
4. Copy the ENTIRE content of the downloaded JSON file and paste it as the value for the variable.

For local development, add this to a .env.local file.
For production (e.g., Vercel), add this in your project's "Environment Variables" settings.

This is a configuration error, not a bug in the code. The application cannot run without these credentials.
        `);
    }

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
