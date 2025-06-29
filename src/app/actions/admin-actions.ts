'use server';

import { revalidatePath } from 'next/cache';
import { doc, updateDoc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { adminDB } from '@/lib/firebase-admin';
import { type UserProfile, type PaymentGatewaySettings, type AnalyticsData } from '@/lib/types';

export async function updateUserProfileStatus(userId: string, newStatus: 'Aprovado' | 'Rejeitado' | 'Pendente') {
    try {
        const userRef = doc(adminDB, 'users', userId);
        
        let dbStatus: UserProfile['profileStatus'] = 'pending_review';
        if (newStatus === 'Aprovado') dbStatus = 'approved';
        if (newStatus === 'Rejeitado') dbStatus = 'rejected';

        await updateDoc(userRef, { profileStatus: dbStatus });

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
        const listingRef = doc(adminDB, collectionName, listingId);
        
        const finalStatus = collectionName === 'services' && newStatus === 'Aprovado' ? 'Ativo' : newStatus;
        
        await updateDoc(listingRef, { status: finalStatus });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error(`Error updating ${collectionName} status:`, error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getPaymentSettings(): Promise<PaymentGatewaySettings> {
    const docRef = doc(adminDB, 'settings', 'payment');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as PaymentGatewaySettings;
    }
    // Return default empty structure if not found
    return { mercadoPago: {} };
}

export async function updatePaymentSettings(data: PaymentGatewaySettings) {
    try {
        const docRef = doc(adminDB, 'settings', 'payment');
        await setDoc(docRef, data, { merge: true });

        revalidatePath('/admin/settings/payments');
        return { success: true, message: 'Configurações salvas com sucesso!' };
    } catch (error) {
        console.error("Error updating payment settings:", error);
        return { success: false, error: (error as Error).message };
    }
}


export async function getAdminDashboardAnalytics(): Promise<AnalyticsData> {
    try {
        const pageViewsRef = doc(adminDB, 'analytics', 'page_views');
        const loginsRef = doc(adminDB, 'analytics', 'logins');
        const salesRef = doc(adminDB, 'analytics', 'sales');

        const [pageViewsSnap, loginsSnap, salesSnap] = await Promise.all([
            getDoc(pageViewsRef),
            getDoc(loginsRef),
            getDoc(salesRef),
        ]);

        const analytics: AnalyticsData = {
            pageViews: pageViewsSnap.exists() ? pageViewsSnap.data() : { home: 0 },
            logins: loginsSnap.exists() ? loginsSnap.data() : { total: 0 },
            sales: salesSnap.exists() ? salesSnap.data() : { totalRevenue: 0, packagesSold: 0 },
        };

        return analytics;

    } catch (error) {
        console.error("Error fetching admin analytics:", error);
        return {}; // Return empty object on error
    }
}
