
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { adminDB } from '@/lib/firebase-admin';
import { getAdminDashboardAnalytics } from '@/app/actions/admin-actions';
import type { UserProfile, Opportunity, ServiceListing, AnalyticsData } from '@/lib/types';
import { AdminDashboardClient } from './admin-dashboard-client';


type AdminUser = Pick<UserProfile, 'uid' | 'name' | 'email' | 'role' | 'profileStatus' | 'createdAt' | 'credits'>;

async function getData() {
    try {
        const [usersSnapshot, oppsSnapshot, servicesSnapshot, analyticsData] = await Promise.all([
            getDocs(query(collection(adminDB, 'users'), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(adminDB, 'opportunities'), where('status', '==', 'Pendente'))),
            getDocs(query(collection(adminDB, 'services'), where('status', '==', 'Pendente'))),
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
