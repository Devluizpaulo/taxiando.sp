
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { type UserProfile, type PaymentGatewaySettings, type AnalyticsData } from '@/lib/types';

export async function updateUserProfileStatus(userId: string, newStatus: 'Aprovado' | 'Rejeitado' | 'Pendente') {
    try {
        const userRef = adminDB.collection('users').doc(userId);
        
        let dbStatus: UserProfile['profileStatus'] = 'pending_review';
        if (newStatus === 'Aprovado') dbStatus = 'approved';
        if (newStatus === 'Rejeitado') dbStatus = 'rejected';

        await userRef.update({ profileStatus: dbStatus });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error updating user profile status:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateListingStatus(
    listingId: string, 
    collectionName: 'opportunities' | 'services', 
    newStatus: 'Aprovado' | 'Rejeitado'
) {
    try {
        const listingRef = adminDB.collection(collectionName).doc(listingId);
        
        const finalStatus = collectionName === 'services' && newStatus === 'Aprovado' ? 'Ativo' : newStatus;
        
        await listingRef.update({ status: finalStatus });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error(`Error updating ${collectionName} status:`, error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getPaymentSettings(): Promise<PaymentGatewaySettings> {
    const docRef = adminDB.collection('settings').doc('payment');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        return docSnap.data() as PaymentGatewaySettings;
    }
    // Return default empty structure if not found
    return { mercadoPago: {} };
}

export async function updatePaymentSettings(data: PaymentGatewaySettings) {
    try {
        const docRef = adminDB.collection('settings').doc('payment');
        await docRef.set(data, { merge: true });

        revalidatePath('/admin/settings/payments');
        return { success: true, message: 'Configurações salvas com sucesso!' };
    } catch (error) {
        console.error("Error updating payment settings:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function ensureInitialData() {
    try {
        const settingsRef = adminDB.collection('settings').doc('payment');
        const analyticsPageViewsRef = adminDB.collection('analytics').doc('page_views');
        const analyticsLoginsRef = adminDB.collection('analytics').doc('logins');
        const analyticsSalesRef = adminDB.collection('analytics').doc('sales');

        const settingsSnap = await settingsRef.get();
        if (!settingsSnap.exists) {
            await settingsRef.set({ mercadoPago: { publicKey: '', accessToken: '' } });
        }

        const pageViewsSnap = await analyticsPageViewsRef.get();
        if (!pageViewsSnap.exists) {
            await analyticsPageViewsRef.set({ home: 0 });
        }
        
        const loginsSnap = await analyticsLoginsRef.get();
        if (!loginsSnap.exists) {
            await analyticsLoginsRef.set({ total: 0 });
        }

        const salesSnap = await analyticsSalesRef.get();
        if (!salesSnap.exists) {
            await analyticsSalesRef.set({ totalRevenue: 0, packagesSold: 0 });
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error ensuring initial data:", error);
        return { success: false, error: (error as Error).message };
    }
}


export async function getAdminDashboardAnalytics(): Promise<AnalyticsData> {
    try {
        const pageViewsRef = adminDB.collection('analytics').doc('page_views');
        const loginsRef = adminDB.collection('analytics').doc('logins');
        const salesRef = adminDB.collection('analytics').doc('sales');

        const [pageViewsSnap, loginsSnap, salesSnap] = await Promise.all([
            pageViewsRef.get(),
            loginsRef.get(),
            salesRef.get(),
        ]);

        const analytics: AnalyticsData = {
            pageViews: pageViewsSnap.exists ? pageViewsSnap.data() : { home: 0 },
            logins: loginsSnap.exists ? loginsSnap.data() : { total: 0 },
            sales: salesSnap.exists ? salesSnap.data() : { totalRevenue: 0, packagesSold: 0 },
        };

        return analytics;

    } catch (error) {
        console.error("Error fetching admin analytics:", error);
        return {}; // Return empty object on error
    }
}
