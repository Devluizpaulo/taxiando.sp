import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This pattern ensures that the Firebase Admin app is initialized only once.
if (getApps().length === 0) {
  initializeApp();
}

const adminAuth = getAuth();
const db = getFirestore();

export { adminAuth, db, Timestamp };
