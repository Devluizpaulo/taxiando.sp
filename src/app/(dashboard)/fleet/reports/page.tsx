
import { getFleetReportData } from '@/app/actions/fleet-actions';
import { FleetReportsClientPage } from './reports-client-page';
import { adminAuth } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';


export default async function FleetReportsPage() {
    const user = await adminAuth.getAuthenticatedUser();

    if (!user) {
        // This should be handled by middleware or layout protection, but as a fallback:
        redirect('/login');
    }

    const reportData = await getFleetReportData(user.uid);
    
    return <FleetReportsClientPage initialReportData={reportData} />;
}
