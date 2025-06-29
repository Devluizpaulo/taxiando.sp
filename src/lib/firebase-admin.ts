import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (admin.apps.length === 0) {
    admin.initializeApp();
}

const adminDB = getFirestore();
const adminAuth = getAuth();

export { adminAuth, adminDB, Timestamp };
