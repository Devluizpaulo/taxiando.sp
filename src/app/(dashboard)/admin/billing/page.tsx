
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDB } from '@/lib/firebase-admin';
import { type CreditPackage } from '@/lib/types';
import { AdminBillingClientPage } from './billing-client-page';

async function getPackages(): Promise<CreditPackage[]> {
    try {
        const packagesCollection = adminDB.collection('credit_packages');
        const q = query(packagesCollection, orderBy('price', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditPackage));
    } catch (error) {
        console.error("Error fetching credit packages: ", error);
        return [];
    }
}

export default async function AdminBillingPage() {
    const packages = await getPackages();
    return <AdminBillingClientPage initialPackages={packages} />;
}
