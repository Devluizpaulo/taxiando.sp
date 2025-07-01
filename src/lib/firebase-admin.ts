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
            throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Please ensure it is a valid JSON string.');
        }
    } else {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error(`
CRITICAL: Firebase Admin SDK credentials are not set. This is the final configuration step.

There are two ways to provide credentials:

METHOD 1 (Recommended for Vercel):
1. Create a single environment variable named 'FIREBASE_SERVICE_ACCOUNT_JSON'.
2. Copy the ENTIRE content of your Firebase service account JSON file and paste it as the value for this variable.

METHOD 2 (Alternative):
Set three separate environment variables:
 - FIREBASE_PROJECT_ID: from "project_id" in your JSON file.
 - FIREBASE_CLIENT_EMAIL: from "client_email" in your JSON file.
 - FIREBASE_PRIVATE_KEY: the "private_key" value from your JSON file.

If you don't have a service account file:
1. Go to your Firebase Project Settings > Service Accounts.
2. Click "Generate new private key" to download the JSON file.

This is a configuration error, not a bug in the code. The application cannot run without these credentials.
        `);
        }
        
        serviceAccount = {
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        };
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
