

'use server';
import { adminDB, adminAuth, Timestamp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export async function trackPageView(page: string) {
    try {
        const docRef = adminDB.collection('analytics').doc('page_views');
        await docRef.set({
            [page]: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return; // Gracefully fail during initial setup
        }
        // Fail silently so it doesn't break the page load, but log for debugging
        console.error(`Error tracking page view for '${page}':`, (error as Error).message);
    }
}

export async function trackLogin(userId: string) {
    try {
        const userRef = adminDB.collection('users').doc(userId);
        const analyticsRef = adminDB.collection('analytics').doc('logins');
        
        // Revoke any previous sessions to ensure single-session login
        await adminAuth.revokeRefreshTokens(userId);
        const sessionValidSince = Timestamp.now();
        
        // Increment login count and set the session valid time
        await Promise.all([
            userRef.set({ 
                loginCount: admin.firestore.FieldValue.increment(1),
                sessionValidSince: sessionValidSince,
            }, { merge: true }),
            analyticsRef.set({ total: admin.firestore.FieldValue.increment(1) }, { merge: true })
        ]);

    } catch (error) {
        // Fail silently
    }
}
