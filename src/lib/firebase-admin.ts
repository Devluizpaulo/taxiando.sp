import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (getApps().length === 0) {
    // In a Google-managed environment, initializeApp() with no arguments 
    // should find the default credentials.
    app = initializeApp();
} else {
    app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, Timestamp };
