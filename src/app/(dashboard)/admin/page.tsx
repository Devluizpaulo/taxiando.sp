
import { adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDashboardAnalytics } from '@/app/actions/admin-actions';
import type { UserProfile, Opportunity, ServiceListing, AnalyticsData } from '@/lib/types';
import { AdminDashboardClient } from './admin-dashboard-client';


type AdminUser = Pick<UserProfile, 'uid' | 'name' | 'email' | 'role' | 'profileStatus' | 'credits'> & {
    createdAt: string;
};

async function getData() {
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
        console.error("Failed to fetch admin users data:", (error as Error).message || error);
    }
    
    try {
        const oppsSnapshot = await adminDB.collection('opportunities').where('status', '==', 'Pendente').get();
        oppsData = oppsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
    } catch (error) {
        console.error("Failed to fetch admin opportunities data:", (error as Error).message || error);
    }
    
    try {
        const servicesSnapshot = await adminDB.collection('services').where('status', '==', 'Pendente').get();
        servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceListing));
    } catch (error) {
        console.error("Failed to fetch admin services data:", (error as Error).message || error);
    }

    try {
        analyticsData = await getAdminDashboardAnalytics();
    } catch (analyticsError) {
        console.error("Failed to fetch admin analytics, continuing without it:", (analyticsError as Error).message || analyticsError);
    }

    return { 
        users: usersData, 
        opportunities: oppsData, 
        services: servicesData, 
        analytics: analyticsData 
    };
}

export default async function AdminPage() {
    const { users, opportunities, services, analytics } = await getData();
    
    return (
        <AdminDashboardClient
            initialUsers={users}
            initialOpportunities={opportunities}
            initialServices={services}
            initialAnalytics={analytics}
        />
    );
}
