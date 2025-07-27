
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, adminAuth } from '@/lib/firebase-admin';
import { type UserProfile, type GlobalSettings, type AnalyticsData, type AdminUser, type Vehicle, type ServiceListing, type Course, type Coupon, type CreditPackage, type PaymentGatewaySettings } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as z from 'zod';

declare module '@/lib/types' {
  interface GlobalSettings {
    cityGuideCategories?: string[];
    cityGuideRegions?: string[];
  }
}

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

export async function getUserProfileById(userId: string): Promise<AdminUser | null> {
    if (!userId) return null;
    try {
        const userDoc = await adminDB.collection('users').doc(userId).get();
        if (!userDoc.exists) return null;

        const data = userDoc.data() as UserProfile;
        
        const toISO = (ts?: Timestamp): string | undefined => ts ? ts.toDate().toISOString() : undefined;

        return {
            ...data,
            uid: userDoc.id,
            createdAt: typeof data.createdAt === 'object' && data.createdAt !== null && typeof (data.createdAt as any).toDate === 'function' ? toISO(data.createdAt) : new Date().toISOString(),
            cnhExpiration: typeof data.cnhExpiration === 'object' && data.cnhExpiration !== null && typeof (data.cnhExpiration as any).toDate === 'function' ? toISO(data.cnhExpiration) : undefined,
            condutaxExpiration: typeof data.condutaxExpiration === 'object' && data.condutaxExpiration !== null && typeof (data.condutaxExpiration as any).toDate === 'function' ? toISO(data.condutaxExpiration) : undefined,
            alvaraExpiration: typeof data.alvaraExpiration === 'object' && data.alvaraExpiration !== null && typeof (data.alvaraExpiration as any).toDate === 'function' ? toISO(data.alvaraExpiration) : undefined,
            lastNotificationCheck: typeof data.lastNotificationCheck === 'object' && data.lastNotificationCheck !== null && typeof (data.lastNotificationCheck as any).toDate === 'function' ? toISO(data.lastNotificationCheck) : undefined,
            lastSeekingRentalsCheck: typeof data.lastSeekingRentalsCheck === 'object' && data.lastSeekingRentalsCheck !== null && typeof (data.lastSeekingRentalsCheck as any).toDate === 'function' ? toISO(data.lastSeekingRentalsCheck) : undefined,
        } as AdminUser;

    } catch (error) {
        console.error("Error fetching user profile by ID:", error);
        return null;
    }
}

const adminEditUserSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório.").optional(),
  phone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos.").optional(),
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
        const { name, ...restOfValues } = validation.data;

        const updateData: Partial<UserProfile> = {
            ...restOfValues,
        };
        
        const userDoc = await userRef.get();
        const existingData = userDoc.data();

        if (existingData?.personType === 'pj') {
            updateData.nomeFantasia = name;
        } else {
            updateData.name = name;
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
        await Promise.all([
            adminAuth.deleteUser(userId),
            adminDB.collection('users').doc(userId).delete()
        ]);
        
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
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
             const serviceStatus = newStatus === 'Aprovado' ? 'Ativo' : 'Rejeitado';
             dataToUpdate = { status: serviceStatus };
        } else if (collectionName === 'vehicles') {
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
        contactEmail: 'contato@taxiando.com',
        contactPhone: '(11) 99999-9999',
        activeGateway: 'mercadoPago',
        mercadoPagoPublicKey: '',
        mercadoPagoAccessToken: '',
        stripePublicKey: '',
        stripeSecretKey: '',
        activeThemeName: 'Padrão',
        socialMedia: {
          instagram: { url: 'https://instagram.com', enabled: true },
          facebook: { url: 'https://facebook.com', enabled: true },
          whatsapp: { url: 'https://wa.me/5511999999999', enabled: false },
        },
        seo: {
            metaDescription: 'A plataforma completa para o profissional do volante em São Paulo. Encontre veículos, cursos e uma comunidade para acelerar seus resultados.',
            metaKeywords: 'táxi, sp, taxista, frota, aluguel de táxi, cursos para taxistas',
        },
        homepage: {
            showAgenda: true,
            showTestimonials: true,
            showPartners: true,
        },
        user: {
            allowPublicRegistration: true,
            defaultNewUserCredits: 0,
        },
        legal: {
            termsOfService: '## Termos de Serviço\n\nBem-vindo! O conteúdo dos termos de serviço pode ser editado no painel do administrador.',
            privacyPolicy: '## Política de Privacidade\n\nBem-vindo! O conteúdo da política de privacidade pode ser editado no painel do administrador.',
        },
        themes: [
            {
                name: "Padrão",
                colors: {
                    '--background': '0 0% 94.1%', '--foreground': '222.2 84% 4.9%',
                    '--card': '0 0% 100%', 
                    '--primary': '217.2 91.2% 59.8%', // Blue
                    '--primary-foreground': '0 0% 98%', // White
                    '--secondary': '0 0% 96.1%',
                    '--accent': '55 100% 50%', // Yellow
                    '--destructive': '0 84.2% 60.2%',
                    '--border': '0 0% 89.8%', '--input': '0 0% 89.8%', 
                    '--ring': '217.2 91.2% 59.8%',
                }
            },
            {
                name: "Natalino",
                colors: {
                    '--background': '0 0% 94.1%', '--foreground': '222.2 84% 4.9%',
                    '--card': '0 0% 100%', '--primary': '0 84.2% 60.2%',
                    '--primary-foreground': '0 0% 98%', '--secondary': '0 0% 96.1%',
                    '--accent': '120 60% 30%', '--destructive': '0 84.2% 60.2%',
                    '--border': '0 0% 89.8%', '--input': '0 0% 89.8%', '--ring': '120 60% 30%',
                }
            }
        ],
        cityGuideCategories: [],
        cityGuideRegions: [],
    };

    try {
        const docRef = adminDB.collection('settings').doc('global');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            // Merge defaults with existing data to handle newly added settings gracefully
            const existingData = docSnap.data();
            return {
                ...defaultSettings,
                ...existingData,
                seo: { ...defaultSettings.seo, ...existingData?.seo },
                homepage: { ...defaultSettings.homepage, ...existingData?.homepage },
                user: { ...defaultSettings.user, ...existingData?.user },
                legal: { ...defaultSettings.legal, ...existingData?.legal },
                socialMedia: { ...defaultSettings.socialMedia, ...existingData?.socialMedia },
                themes: existingData?.themes && existingData.themes.length > 0 ? existingData.themes : defaultSettings.themes,
                cityGuideCategories: existingData?.cityGuideCategories || defaultSettings.cityGuideCategories,
                cityGuideRegions: existingData?.cityGuideRegions || defaultSettings.cityGuideRegions,
            } as GlobalSettings;
        }
        
        await docRef.set(defaultSettings);
        return defaultSettings;
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            console.warn("Could not fetch global settings because Admin SDK is not initialized. Returning default settings.");
        } else {
             console.error("Error fetching global settings, returning defaults:", error);
        }
        return defaultSettings;
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

export async function getPublicSettings() {
     try {
        const settings = await getGlobalSettings();
        return {
            siteName: settings.siteName,
            logoUrl: settings.logoUrl,
            seo: settings.seo,
            homepage: settings.homepage,
            user: settings.user,
        };
    } catch (error) {
        // Return a default structure if there's an error
        return {
            siteName: 'Táxiando SP',
            logoUrl: '/logo.png',
            seo: {
                metaDescription: 'A plataforma completa para o profissional do volante em São Paulo.',
                metaKeywords: 'táxi, sp, taxista, frota',
            },
            homepage: {
                showAgenda: true,
                showTestimonials: true,
                showPartners: true,
            },
            user: {
                allowPublicRegistration: true,
                defaultNewUserCredits: 0,
            }
        }
    }
}

export async function getPaymentSettings(): Promise<PaymentGatewaySettings> {
    try {
        const settings = await getGlobalSettings();
        return {
            activeGateway: settings.activeGateway,
            mercadoPago: {
                publicKey: settings.mercadoPagoPublicKey,
                accessToken: settings.mercadoPagoAccessToken,
            },
            stripe: {
                publicKey: settings.stripePublicKey,
                secretKey: settings.stripeSecretKey,
            }
        }
    } catch(e) {
        return { 
            activeGateway: 'mercadoPago',
        };
    }
}

/**
 * Atualiza apenas as configurações de pagamento no Firestore.
 */
export async function updatePaymentSettings(data: {
  activeGateway: string;
  mercadoPagoPublicKey: string;
  mercadoPagoAccessToken: string;
  stripePublicKey: string;
  stripeSecretKey: string;
}) {
  try {
    const docRef = adminDB.collection('settings').doc('global');
    await docRef.set({
      activeGateway: data.activeGateway,
      mercadoPagoPublicKey: data.mercadoPagoPublicKey,
      mercadoPagoAccessToken: data.mercadoPagoAccessToken,
      stripePublicKey: data.stripePublicKey,
      stripeSecretKey: data.stripeSecretKey,
    }, { merge: true });
    revalidatePath('/admin/settings/payments');
    return { success: true, message: 'Configurações de pagamento salvas com sucesso!' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}


export async function ensureInitialData() {
    try {
        const settingsRef = adminDB.collection('settings').doc('global');
        const analyticsPageViewsRef = adminDB.collection('analytics').doc('page_views');
        const analyticsLoginsRef = adminDB.collection('analytics').doc('logins');
        const analyticsSalesRef = adminDB.collection('analytics').doc('sales');

        const settingsSnap = await settingsRef.get();
        if (!settingsSnap.exists) {
            await getGlobalSettings();
        }

        const pageViewsSnap = await analyticsPageViewsRef.get();
        if (!pageViewsSnap.exists) {
            await pageViewsSnap.ref.set({ home: 0 });
        }
        
        const loginsSnap = await analyticsLoginsRef.get();
        if (!loginsSnap.exists) {
            await loginsSnap.ref.set({ total: 0 });
        }

        const salesSnap = await analyticsSalesRef.get();
        if (!salesSnap.exists) {
            await salesSnap.ref.set({ totalRevenue: 0, packagesSold: 0 });
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function getAdminDashboardAnalytics(periodStart?: Date): Promise<AnalyticsData> {
    try {
        const pageViewsRef = adminDB.collection('analytics').doc('page_views');
        const loginsRef = adminDB.collection('analytics').doc('logins');
        const salesRef = adminDB.collection('analytics').doc('sales');
        const contentViewsRef = adminDB.collection('analytics').doc('content_views');
        const contentSharesRef = adminDB.collection('analytics').doc('content_shares');

        // Filtro de período
        let pageViewsCounts: Record<string, number> = {};
        let loginsCount = 0;
        let sharesCounts: Record<string, number> = {};
        if (periodStart) {
            // Page Views
            const pageViewsEventsSnap = await pageViewsRef.collection('events')
                .where('timestamp', '>=', periodStart)
                .get();
            pageViewsEventsSnap.forEach(doc => {
                const data = doc.data();
                if (data.page) {
                    pageViewsCounts[data.page] = (pageViewsCounts[data.page] || 0) + 1;
                }
            });
            // Logins
            const loginsEventsSnap = await loginsRef.collection('events')
                .where('timestamp', '>=', periodStart)
                .get();
            loginsCount = loginsEventsSnap.size;
            // Shares
            const sharesEventsSnap = await contentSharesRef.collection('events')
                .where('timestamp', '>=', periodStart)
                .get();
            sharesEventsSnap.forEach(doc => {
                const data = doc.data();
                if (data.contentType) {
                    const key = `${data.contentType}_total_shares`;
                    sharesCounts[key] = (sharesCounts[key] || 0) + 1;
                }
            });
        }

        // Get top content for each type
        const topContent: AnalyticsData['topContent'] = {};
        
        try {
            // Get top blog posts
            const blogViewsSnapshot = await contentViewsRef.collection('blog').orderBy('views', 'desc').limit(5).get();
            const blogSharesSnapshot = await contentSharesRef.collection('blog').orderBy('totalShares', 'desc').limit(5).get();
            
            const blogViewsMap = new Map();
            blogViewsSnapshot.docs.forEach(doc => {
                blogViewsMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            const blogSharesMap = new Map();
            blogSharesSnapshot.docs.forEach(doc => {
                blogSharesMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            topContent.blog = Array.from(blogViewsMap.keys()).map(id => {
                const views = blogViewsMap.get(id);
                const shares = blogSharesMap.get(id);
                return {
                    id,
                    title: views?.title || shares?.title || id,
                    views: views?.views || 0,
                    shares: shares?.totalShares || 0
                };
            }).sort((a, b) => (b.views + b.shares) - (a.views + a.shares)).slice(0, 5);

            // Get top events
            const eventViewsSnapshot = await contentViewsRef.collection('event').orderBy('views', 'desc').limit(5).get();
            const eventSharesSnapshot = await contentSharesRef.collection('event').orderBy('totalShares', 'desc').limit(5).get();
            
            const eventViewsMap = new Map();
            eventViewsSnapshot.docs.forEach(doc => {
                eventViewsMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            const eventSharesMap = new Map();
            eventSharesSnapshot.docs.forEach(doc => {
                eventSharesMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            topContent.events = Array.from(eventViewsMap.keys()).map(id => {
                const views = eventViewsMap.get(id);
                const shares = eventSharesMap.get(id);
                return {
                    id,
                    title: views?.title || shares?.title || id,
                    views: views?.views || 0,
                    shares: shares?.totalShares || 0
                };
            }).sort((a, b) => (b.views + b.shares) - (a.views + a.shares)).slice(0, 5);

            // Get top courses
            const courseViewsSnapshot = await contentViewsRef.collection('course').orderBy('views', 'desc').limit(5).get();
            const courseSharesSnapshot = await contentSharesRef.collection('course').orderBy('totalShares', 'desc').limit(5).get();
            
            const courseViewsMap = new Map();
            courseViewsSnapshot.docs.forEach(doc => {
                courseViewsMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            const courseSharesMap = new Map();
            courseSharesSnapshot.docs.forEach(doc => {
                courseSharesMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            topContent.courses = Array.from(courseViewsMap.keys()).map(id => {
                const views = courseViewsMap.get(id);
                const shares = courseSharesMap.get(id);
                return {
                    id,
                    title: views?.title || shares?.title || id,
                    views: views?.views || 0,
                    shares: shares?.totalShares || 0
                };
            }).sort((a, b) => (b.views + b.shares) - (a.views + a.shares)).slice(0, 5);

            // Get top services
            const serviceViewsSnapshot = await contentViewsRef.collection('service').orderBy('views', 'desc').limit(5).get();
            const serviceSharesSnapshot = await contentSharesRef.collection('service').orderBy('totalShares', 'desc').limit(5).get();
            
            const serviceViewsMap = new Map();
            serviceViewsSnapshot.docs.forEach(doc => {
                serviceViewsMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            const serviceSharesMap = new Map();
            serviceSharesSnapshot.docs.forEach(doc => {
                serviceSharesMap.set(doc.id, { ...doc.data(), id: doc.id });
            });
            
            topContent.services = Array.from(serviceViewsMap.keys()).map(id => {
                const views = serviceViewsMap.get(id);
                const shares = serviceSharesMap.get(id);
                return {
                    id,
                    title: views?.title || shares?.title || id,
                    views: views?.views || 0,
                    shares: shares?.totalShares || 0
                };
            }).sort((a, b) => (b.views + b.shares) - (a.views + a.shares)).slice(0, 5);

        } catch (error) {
            console.error("Error fetching top content:", error);
        }

        const analytics: AnalyticsData = {
            pageViews: periodStart ? pageViewsCounts : (await pageViewsRef.get()).data() || {},
            logins: periodStart ? { total: loginsCount } : (await loginsRef.get()).data() || { total: 0 },
            sales: (await salesRef.get()).data() || { totalRevenue: 0, packagesSold: 0 },
            contentViews: (await contentViewsRef.get()).data() || {},
            contentShares: periodStart ? sharesCounts : (await contentSharesRef.get()).data() || {},
            topContent,
        };

        return analytics;

    } catch (error) {
        return {};
    }
}

const toISO = (ts?: Timestamp): string | undefined => ts ? ts.toDate().toISOString() : undefined;

export async function getAdminDashboardData(periodStart?: Date) {
    await ensureInitialData();

    let usersData: AdminUser[] = [];
    let vehiclesData: Vehicle[] = [];
    let servicesData: ServiceListing[] = [];
    let analyticsData: AnalyticsData = {};

    try {
        const [usersSnapshot, vehiclesSnapshot, servicesSnapshot, dashboardAnalytics] = await Promise.all([
            adminDB.collection('users').orderBy('createdAt', 'desc').get(),
            adminDB.collection('vehicles').where('moderationStatus', '==', 'Pendente').get(),
            adminDB.collection('services').where('status', '==', 'Pendente').get(),
            getAdminDashboardAnalytics(periodStart)
        ]);

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
                lastSeekingRentalsCheck: typeof data.lastSeekingRentalsCheck === 'object' && data.lastSeekingRentalsCheck !== null && typeof (data.lastSeekingRentalsCheck as any).toDate === 'function' ? toISO(data.lastSeekingRentalsCheck) : undefined,
                sessionValidSince: typeof data.sessionValidSince === 'object' && data.sessionValidSince !== null && typeof (data.sessionValidSince as any).toDate === 'function' ? toISO(data.sessionValidSince) : (typeof data.sessionValidSince === 'string' ? data.sessionValidSince : undefined),
            } as AdminUser;
        });

        vehiclesData = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
        servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceListing));
        analyticsData = dashboardAnalytics;

    } catch (error) {
        console.error("Error fetching admin dashboard data in parallel:", error);
        // Gracefully return empty data if something fails, so the page doesn't crash.
        // The error is logged on the server for debugging.
        return { 
            users: [], 
            vehicles: [], 
            services: [], 
            analytics: {} 
        };
    }

    try {
        const allVehiclesSnapshot = await adminDB.collection('vehicles').get();
        const vehicleCountsByFleet: Record<string, number> = {};
        allVehiclesSnapshot.forEach(doc => {
            const fleetId = doc.data().fleetId;
            vehicleCountsByFleet[fleetId] = (vehicleCountsByFleet[fleetId] || 0) + 1;
        });

        const allServicesSnapshot = await adminDB.collection('services').get();
        const serviceCountsByProvider: Record<string, number> = {};
        allServicesSnapshot.forEach(doc => {
            const providerId = doc.data().providerId;
            serviceCountsByProvider[providerId] = (serviceCountsByProvider[providerId] || 0) + 1;
        });
        
        usersData = usersData.map(user => {
            if (user.role === 'fleet') {
                return { ...user, vehicleCount: vehicleCountsByFleet[user.uid] || 0 };
            }
            if (user.role === 'provider') {
                return { ...user, serviceCount: serviceCountsByProvider[user.uid] || 0 };
            }
            return user;
        });

    } catch(e) {
        console.error("Error counting vehicles/services for admin dashboard", e);
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


export async function getAdminReportsData() {
    try {
        const [usersSnapshot, coursesSnapshot, creditPackagesSnapshot, couponsSnapshot, vehiclesSnapshot, applicationsSnapshot] = await Promise.all([
            adminDB.collection('users').get(),
            adminDB.collection('courses').get(),
            adminDB.collection('credit_packages').get(),
            adminDB.collection('coupons').get(),
            adminDB.collection('vehicles').get(),
            adminDB.collection('applications').get(),
        ]);
        
        // User reports
        const users = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AdminUser));
        const userCounts = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const topRatedDrivers = users.filter(u => u.role === 'driver' && u.averageRating).sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 5);
        
        // Financial reports
        const packages = creditPackagesSnapshot.docs.map(doc => {
            const data = doc.data() as CreditPackage;
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function'
                  ? (data.createdAt as any).toDate().toISOString()
                  : (typeof data.createdAt === 'string' ? data.createdAt : undefined),
                updatedAt: data.updatedAt && typeof (data.updatedAt as any).toDate === 'function'
                  ? (data.updatedAt as any).toDate().toISOString()
                  : (typeof data.updatedAt === 'string' ? data.updatedAt : undefined),
            } as CreditPackage;
        });
        const topUsedCoupons = couponsSnapshot.docs.map(doc => doc.data() as Coupon).sort((a, b) => (b.uses || 0) - (a.uses || 0)).slice(0, 5);

        // Engagement reports
        const courses = coursesSnapshot.docs.map(doc => {
            const data = doc.data() as Course;
            return {
                ...data,
                id: doc.id,
                createdAt: (typeof data.createdAt === 'object' && data.createdAt !== null && typeof (data.createdAt as any).toDate === 'function')
                  ? (data.createdAt as any).toDate().toISOString()
                  : (typeof data.createdAt === 'string' ? data.createdAt : undefined),
            } as Course;
        });
        const topCourses = courses.sort((a, b) => (b.students || 0) - (a.students || 0)).slice(0, 5);
        
        const vehicles = vehiclesSnapshot.docs.map(doc => doc.data() as Vehicle);
        const rentedVehicles = vehicles.filter(v => v.status === 'Alugado').length;
        const totalApplications = applicationsSnapshot.size;


        return {
            success: true,
            userReports: {
                totalUsers: users.length,
                userCounts,
                topRatedDrivers,
            },
            financialReports: {
                packages,
                topUsedCoupons,
            },
            engagementReports: {
                topCourses,
                totalVehicles: vehicles.length,
                rentedVehicles,
                totalApplications,
            }
        }
    } catch(error) {
        console.error("Error fetching admin reports data:", error);
        return { success: false, error: (error as Error).message };
    }
}
