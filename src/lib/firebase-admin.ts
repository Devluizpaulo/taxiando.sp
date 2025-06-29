'use server';

import { initializeApp, getApps, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (getApps().length === 0) {
    // In a Google-managed environment, applicationDefault() should find credentials.
    app = initializeApp({
        credential: applicationDefault(),
    });
} else {
    app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
