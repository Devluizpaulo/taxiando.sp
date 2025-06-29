import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (getApps().length === 0) {
    // In a managed environment, initializeApp() with no arguments should find default credentials.
    // This is the most robust way for App Hosting.
    app = initializeApp();
} else {
    app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, Timestamp };
