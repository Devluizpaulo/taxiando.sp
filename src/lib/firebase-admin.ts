import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

if (admin.apps.length === 0) {
    admin.initializeApp({
        storageBucket: 'taxiandosp-519b1.appspot.com'
    });
}

const adminDB = getFirestore();
const adminAuth = getAuth();
const adminStorage = getStorage();

export { adminAuth, adminDB, adminStorage, Timestamp };
