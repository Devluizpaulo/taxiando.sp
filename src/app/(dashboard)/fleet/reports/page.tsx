
import { getFleetReportData } from '@/app/actions/fleet-actions';
import { FleetReportsClientPage } from './reports-client-page';
import { adminAuth } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';


export default async function FleetReportsPage() {
    let user;
    try {
        const session = (await cookies()).get('__session')?.value || '';
        const decodedClaims = await adminAuth.verifySessionCookie(session, true);
        user = decodedClaims;
    } catch (error) {
        // Session cookie is invalid or expired.
        // This should be handled by middleware or layout protection, but as a fallback:
        redirect('/login');
    }

    const reportData = await getFleetReportData(user.uid);
    
    return <FleetReportsClientPage initialReportData={reportData} />;
}
