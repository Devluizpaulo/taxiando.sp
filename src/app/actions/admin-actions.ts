
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { type UserProfile, type PaymentGatewaySettings, type AnalyticsData, type AdminUser, type Opportunity, type ServiceListing } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';


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
        // Fail silently and return an empty object. The dashboard will show 0 for these values.
        return {};
    }
}


export async function getAdminDashboardData() {
    let usersData: AdminUser[] = [];
    let oppsData: Opportunity[] = [];
    let servicesData: ServiceListing[] = [];
    let analyticsData: AnalyticsData = {};

    try {
        const usersSnapshot = await adminDB.collection('users').orderBy('createdAt', 'desc').get();
        usersData = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                ...data,
                uid: doc.id,
                createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : new Date().toISOString(),
            } as AdminUser;
        });
    } catch (error) {
        // Fail silently
    }
    
    try {
        const oppsSnapshot = await adminDB.collection('opportunities').where('status', '==', 'Pendente').get();
        oppsData = oppsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
    } catch (error) {
        // Fail silently
    }
    
    try {
        const servicesSnapshot = await adminDB.collection('services').where('status', '==', 'Pendente').get();
        servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceListing));
    } catch (error) {
       // Fail silently
    }

    try {
        analyticsData = await getAdminDashboardAnalytics();
    } catch (analyticsError) {
        // Fail silently
    }

    const userGrowthData: { month: string; total: number; }[] = [];
    const months = Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i)).reverse();
    
    months.forEach(month => {
        userGrowthData.push({
            month: format(month, 'MMM/yy', { locale: ptBR }),
            total: 0,
        });
    });

    usersData.forEach(user => {
        const registrationMonth = format(new Date(user.createdAt), 'MMM/yy', { locale: ptBR });
        const monthData = userGrowthData.find(m => m.month === registrationMonth);
        if (monthData) {
            monthData.total += 1;
        }
    });
    
    analyticsData.userGrowth = userGrowthData;

    return { 
        users: usersData, 
        opportunities: oppsData, 
        services: servicesData, 
        analytics: analyticsData 
    };
}
