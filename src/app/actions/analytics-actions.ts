'use server';
import { doc, increment, setDoc } from 'firebase/firestore';
import { adminDB } from '@/lib/firebase-admin';

export async function trackPageView(page: string) {
    try {
        const docRef = doc(adminDB, 'analytics', 'page_views');
        await setDoc(docRef, {
            [page]: increment(1)
        }, { merge: true });
    } catch (error) {
        // Fail silently so it doesn't break the page load
        console.error(`Failed to track page view for ${page}:`, error);
    }
}

export async function trackLogin(userId: string) {
    try {
        const userRef = doc(adminDB, 'users', userId);
        const analyticsRef = doc(adminDB, 'analytics', 'logins');
        
        // Increment on both user profile and central analytics doc
        await Promise.all([
            setDoc(userRef, { loginCount: increment(1) }, { merge: true }),
            setDoc(analyticsRef, { total: increment(1) }, { merge: true })
        ]);

    } catch (error) {
        console.error(`Failed to track login for ${userId}:`, error);
    }
}
