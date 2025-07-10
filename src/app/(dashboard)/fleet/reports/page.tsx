
import { getFleetReportData } from '@/app/actions/fleet-actions';
import { useAuth } from '@/hooks/use-auth';
import { FleetReportsClientPage } from './reports-client-page';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';


export default async function FleetReportsPage() {
    // This is a server component, so we can't use the useAuth hook directly.
    // We get the current user session from the auth object provided by firebase-admin.
    // For this to work in local dev, you must be logged in. In production, it uses the session cookie.
    const user = auth.currentUser;

    if (!user) {
        // This should be handled by middleware or layout protection, but as a fallback:
        redirect('/login');
    }

    const reportData = await getFleetReportData(user.uid);
    
    return <FleetReportsClientPage initialReportData={reportData} />;
}
