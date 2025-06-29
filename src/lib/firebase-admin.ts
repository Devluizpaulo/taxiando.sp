import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;
if (getApps().length === 0) {
  app = initializeApp();
} else {
  app = getApps()[0];
}

const adminAuth = getAuth(app);
const adminDB = getFirestore(app);

export { adminAuth, adminDB, Timestamp };
