'use server';

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Este padrão garante que o aplicativo Firebase Admin seja inicializado apenas uma vez.
if (getApps().length === 0) {
  initializeApp();
}

const adminAuth = getAuth();
const db = getFirestore();

export { adminAuth, db, Timestamp };
