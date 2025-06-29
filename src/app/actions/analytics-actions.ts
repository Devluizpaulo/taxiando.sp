
'use server';
import { adminDB } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export async function trackPageView(page: string) {
    try {
        const docRef = adminDB.collection('analytics').doc('page_views');
        await docRef.set({
            [page]: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
    } catch (error) {
        // Fail silently so it doesn't break the page load
        console.error(`Failed to track page view for ${page}:`, error);
    }
}

export async function trackLogin(userId: string) {
    try {
        const userRef = adminDB.collection('users').doc(userId);
        const analyticsRef = adminDB.collection('analytics').doc('logins');
        
        // Increment on both user profile and central analytics doc
        await Promise.all([
            userRef.set({ loginCount: admin.firestore.FieldValue.increment(1) }, { merge: true }),
            analyticsRef.set({ total: admin.firestore.FieldValue.increment(1) }, { merge: true })
        ]);

    } catch (error) {
        console.error(`Failed to track login for ${userId}:`, error);
    }
}
