
import { adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDashboardAnalytics } from '@/app/actions/admin-actions';
import type { UserProfile, Opportunity, ServiceListing, AnalyticsData } from '@/lib/types';
import { AdminDashboardClient } from './admin-dashboard-client';


type AdminUser = Pick<UserProfile, 'uid' | 'name' | 'email' | 'role' | 'profileStatus' | 'credits'> & {
    createdAt: string;
};

async function getData() {
    try {
        const [usersSnapshot, oppsSnapshot, servicesSnapshot, analyticsData] = await Promise.all([
            adminDB.collection('users').orderBy('createdAt', 'desc').get(),
            adminDB.collection('opportunities').where('status', '==', 'Pendente').get(),
            adminDB.collection('services').where('status', '==', 'Pendente').get(),
            getAdminDashboardAnalytics()
        ]);

        const usersData = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                ...data,
                uid: doc.id,
                createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : new Date().toISOString(),
            } as AdminUser;
        });

        const oppsData = oppsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
        const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceListing));
        
        return { 
            users: usersData, 
            opportunities: oppsData, 
            services: servicesData, 
            analytics: analyticsData 
        };
    } catch (error) {
        console.error("Failed to fetch admin data:", error);
        return { users: [], opportunities: [], services: [], analytics: {} };
    }
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
