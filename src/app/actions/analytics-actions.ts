

'use server';
import { adminDB, adminAuth, Timestamp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export async function trackPageView(page: string) {
    try {
        const docRef = adminDB.collection('analytics').doc('page_views');
        await docRef.set({
            [page]: admin.firestore.FieldValue.increment(1)
        }, { merge: true });

        // Salvar evento individual para métricas reais por período
        await docRef.collection('events').add({
            page,
            timestamp: Timestamp.now(),
        });
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return; // Gracefully fail during initial setup
        }
        // Fail silently so it doesn't break the page load, but log for debugging
        console.error(`Error tracking page view for '${page}':`, (error as Error).message);
    }
}

export async function trackContentView(contentType: 'blog' | 'event' | 'course' | 'service', contentId: string, title?: string) {
    try {
        const docRef = adminDB.collection('analytics').doc('content_views');
        const contentRef = docRef.collection(contentType).doc(contentId);
        
        await contentRef.set({
            views: admin.firestore.FieldValue.increment(1),
            lastViewed: Timestamp.now(),
            title: title || contentId,
        }, { merge: true });
        
        // Also track in the main content views collection
        await docRef.set({
            [`${contentType}_total_views`]: admin.firestore.FieldValue.increment(1)
        }, { merge: true });
        
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return;
        }
        console.error(`Error tracking content view for ${contentType} ${contentId}:`, (error as Error).message);
    }
}

export async function trackContentShare(contentType: 'blog' | 'event' | 'course' | 'service', contentId: string, platform: 'facebook' | 'twitter' | 'whatsapp' | 'linkedin' | 'copy_link') {
    try {
        const docRef = adminDB.collection('analytics').doc('content_shares');
        const contentRef = docRef.collection(contentType).doc(contentId);
        
        await contentRef.set({
            [`shares.${platform}`]: admin.firestore.FieldValue.increment(1),
            totalShares: admin.firestore.FieldValue.increment(1),
            lastShared: Timestamp.now(),
        }, { merge: true });
        
        // Also track in the main shares collection
        await docRef.set({
            [`${contentType}_total_shares`]: admin.firestore.FieldValue.increment(1),
            [`platform_shares.${platform}`]: admin.firestore.FieldValue.increment(1)
        }, { merge: true });

        // Salvar evento individual para métricas reais por período
        await docRef.collection('events').add({
            contentType,
            contentId,
            platform,
            timestamp: Timestamp.now(),
        });
        
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return;
        }
        console.error(`Error tracking content share for ${contentType} ${contentId}:`, (error as Error).message);
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
            analyticsRef.set({ total: admin.firestore.FieldValue.increment(1) }, { merge: true }),
            // Salvar evento individual para métricas reais por período
            analyticsRef.collection('events').add({
                userId,
                timestamp: sessionValidSince,
            })
        ]);

    } catch (error) {
        // Fail silently
    }
}
