
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
        // Fail silently. The page will render with an empty list for this data.
    }
    
    try {
        const oppsSnapshot = await adminDB.collection('opportunities').where('status', '==', 'Pendente').get();
        oppsData = oppsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
    } catch (error) {
        // Fail silently. The page will render with an empty list for this data.
    }
    
    try {
        const servicesSnapshot = await adminDB.collection('services').where('status', '==', 'Pendente').get();
        servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceListing));
    } catch (error) {
        // Fail silently. The page will render with an empty list for this data.
    }

    try {
        analyticsData = await getAdminDashboardAnalytics();
    } catch (analyticsError) {
        // Fail silently. The page will render with 0 for analytics data.
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
