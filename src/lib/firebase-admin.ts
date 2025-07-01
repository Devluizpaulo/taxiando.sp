import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let app: admin.app.App;

if (admin.apps.length === 0) {
    // This is the recommended way to initialize for environments like App Hosting
    // It automatically uses the service account credentials from the environment.
    app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: 'taxiandosp-519b1.appspot.com'
    });
} else {
    app = admin.app();
}

const adminDB = getFirestore(app);
const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminAuth, adminDB, adminStorage, Timestamp };
