
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, adminAuth } from '@/lib/firebase-admin';
import { type UserProfile, type PaymentGatewaySettings, type GlobalSettings, type AnalyticsData, type AdminUser, type Vehicle, type ServiceListing } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as z from 'zod';


export async function updateUserProfileStatus(userId: string, newStatus: 'Aprovado' | 'Rejeitado' | 'Pendente') {
    try {
        const userRef = adminDB.collection('users').doc(userId);
        
        let dbStatus: UserProfile['profileStatus'] = 'pending_review';
        if (newStatus === 'Aprovado') dbStatus = 'approved';
        if (newStatus === 'Rejeitado') dbStatus = 'rejected';

        await userRef.update({ profileStatus: dbStatus });

        revalidatePath('/admin');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true, dbStatus };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

const adminEditUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['driver', 'fleet', 'provider', 'admin']),
  profileStatus: z.enum(['incomplete', 'pending_review', 'approved', 'rejected']),
  credits: z.coerce.number().min(0, "Créditos não podem ser negativos."),
});

export async function updateUserByAdmin(userId: string, data: z.infer<typeof adminEditUserSchema>) {
    try {
        const validation = adminEditUserSchema.safeParse(data);
        if (!validation.success) {
            const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat().join('; ');
            return { success: false, error: errorMessages || 'Dados inválidos.' };
        }
        
        const userRef = adminDB.collection('users').doc(userId);
        
        const updateData: Partial<UserProfile> = {
            ...validation.data,
        };
        
        const userDoc = await userRef.get();
        const existingData = userDoc.data();

        if (existingData?.personType === 'pj') {
            updateData.nomeFantasia = validation.data.name;
            delete (updateData as any).name;
        } else {
            updateData.name = validation.data.name;
        }


        await userRef.update(updateData);

        revalidatePath('/admin');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function enrollUserInCourse(userId: string, courseId: string) {
    try {
        const enrollmentRef = adminDB.collection('users').doc(userId).collection('enrollments').doc(courseId);
        await enrollmentRef.set({
            courseId: courseId,
            enrolledAt: Timestamp.now(),
            status: 'active',
            source: 'admin_grant',
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function deleteUserByAdmin(userId: string) {
    if (!userId) {
        return { success: false, error: "ID do usuário não fornecido." };
    }
    
    try {
        // Wrap auth and db deletion in a promise to run them in parallel
        await Promise.all([
            adminAuth.deleteUser(userId),
            adminDB.collection('users').doc(userId).delete()
        ]);
        
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        // If user is already deleted from Auth, but not DB, it might throw.
        // We can try to delete from DB anyway.
        try {
            await adminDB.collection('users').doc(userId).delete();
            revalidatePath('/admin');
            return { success: true, message: "Usuário removido do banco de dados (já não existia na autenticação)." };
        } catch (dbError) {
             return { success: false, error: (error as Error).message };
        }
    }
}


export async function updateListingStatus(
    listingId: string, 
    collectionName: 'vehicles' | 'services', 
    newStatus: 'Aprovado' | 'Rejeitado'
) {
    try {
        const listingRef = adminDB.collection(collectionName).doc(listingId);
        
        let dataToUpdate: { [key: string]: any } = {};

        if (collectionName === 'services') {
             // For services, 'Aprovado' sets the main status to 'Ativo'
             const serviceStatus = newStatus === 'Aprovado' ? 'Ativo' : 'Rejeitado';
             dataToUpdate = { status: serviceStatus };
        } else if (collectionName === 'vehicles') {
            // For vehicles, we update the specific moderation status field
            dataToUpdate = { moderationStatus: newStatus };
        } else {
             return { success: false, error: "Coleção inválida." };
        }
        
        await listingRef.update(dataToUpdate);

        revalidatePath('/admin');
        revalidatePath('/rentals');
        revalidatePath('/services/marketplace');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
    const defaultSettings: GlobalSettings = { 
        siteName: 'Táxiando SP',
        logoUrl: '/logo.png',
        activeGateway: 'mercadoPago',
        mercadoPagoPublicKey: '',
        mercadoPagoAccessToken: '',
        stripePublicKey: '',
        stripeSecretKey: '',
        activeThemeName: 'Padrão',
        themes: [
            {
                name: "Padrão",
                colors: {
                    '--background': '0 0% 94.1%',
                    '--foreground': '222.2 84% 4.9%',
                    '--card': '0 0% 100%',
                    '--primary': '55 100% 50%',
                    '--primary-foreground': '222.2 84% 4.9%',
                    '--secondary': '0 0% 96.1%',
                    '--accent': '215 100% 33.5%',
                    '--destructive': '0 84.2% 60.2%',
                    '--border': '0 0% 89.8%',
                    '--input': '0 0% 89.8%',
                    '--ring': '215 100% 33.5%',
                }
            }
        ]
    };

    try {
        const docRef = adminDB.collection('settings').doc('global');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return docSnap.data() as GlobalSettings;
        }
        
        // If doc doesn't exist, create it with default values
        await docRef.set(defaultSettings);
        return defaultSettings;
    } catch (error) {
        // If the SDK is not initialized, gracefully return default settings to allow app to build.
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            console.warn("Could not fetch global settings because Admin SDK is not initialized. Returning default settings.");
            return defaultSettings;
        }
        // For other errors, re-throw to indicate a real problem during runtime.
        console.error("Error fetching global settings:", error);
        throw error;
    }
}


export async function updateGlobalSettings(data: GlobalSettings) {
    try {
        const docRef = adminDB.collection('settings').doc('global');
        await docRef.set(data, { merge: true });

        revalidatePath('/', 'layout');
        return { success: true, message: 'Configurações salvas com sucesso!' };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getPublicSettings(): Promise<{siteName: string, logoUrl: string}> {
    try {
        const settings = await getGlobalSettings();
        return {
            siteName: settings.siteName,
            logoUrl: settings.logoUrl,
        };
    } catch (error) {
        return {
            siteName: 'Táxiando SP',
            logoUrl: '/logo.png',
        }
    }
}

export async function getPaymentSettings(): Promise<PaymentGatewaySettings> {
    const docRef = adminDB.collection('settings').doc('payment');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        return docSnap.data() as PaymentGatewaySettings;
    }
    
    return { 
        activeGateway: 'mercadoPago',
        mercadoPago: { publicKey: '', accessToken: '' },
        stripe: { publicKey: '', secretKey: '' },
    };
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
            await settingsRef.set({ 
                activeGateway: 'mercadoPago',
                mercadoPago: { publicKey: '', accessToken: '' },
                stripe: { publicKey: '', secretKey: '' },
            });
        }

        const pageViewsSnap = await analyticsPageViewsRef.get();
        if (!pageViewsSnap.exists) {
            await pageViewsSnap.set({ home: 0 });
        }
        
        const loginsSnap = await analyticsLoginsRef.get();
        if (!loginsSnap.exists) {
            await loginsSnap.set({ total: 0 });
        }

        const salesSnap = await analyticsSalesRef.get();
        if (!salesSnap.exists) {
            await salesSnap.set({ totalRevenue: 0, packagesSold: 0 });
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
            pageViews: pageViewsSnap.exists() ? pageViewsSnap.data() : { home: 0 },
            logins: loginsSnap.exists() ? loginsSnap.data() : { total: 0 },
            sales: salesSnap.exists() ? salesSnap.data() : { totalRevenue: 0, packagesSold: 0 },
        };

        return analytics;

    } catch (error) {
        // Fail silently and return an empty object. The dashboard will show 0 for these values.
        return {};
    }
}

const toISO = (ts?: Timestamp): string | undefined => ts ? ts.toDate().toISOString() : undefined;

export async function getAdminDashboardData() {
    // Ensure analytics documents exist before trying to read them
    await ensureInitialData();

    let usersData: AdminUser[] = [];
    let vehiclesData: Vehicle[] = [];
    let servicesData: ServiceListing[] = [];
    let analyticsData: AnalyticsData = {};

    try {
        const usersSnapshot = await adminDB.collection('users').orderBy('createdAt', 'desc').get();
        usersData = usersSnapshot.docs.map(doc => {
            const data = doc.data() as UserProfile;
            return {
                ...data,
                uid: doc.id,
                createdAt: toISO(data.createdAt) || new Date().toISOString(),
                cnhExpiration: toISO(data.cnhExpiration),
                condutaxExpiration: toISO(data.condutaxExpiration),
                alvaraExpiration: toISO(data.alvaraExpiration),
                lastNotificationCheck: toISO(data.lastNotificationCheck),
            } as AdminUser;
        });
    } catch (error) {
        // Fail silently
    }
    
    try {
        const vehiclesSnapshot = await adminDB.collection('vehicles').where('moderationStatus', '==', 'Pendente').get();
        vehiclesData = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
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
        vehicles: vehiclesData, 
        services: servicesData, 
        analytics: analyticsData 
    };
}
