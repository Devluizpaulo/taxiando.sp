import { getAdminReportsData } from '@/app/actions/admin-actions';
import { ReportsClientPage } from './reports-client-page';
import { notFound } from 'next/navigation';

export default async function AdminReportsPage() {
    const reportData = await getAdminReportsData();
    
    if (!reportData.success) {
        notFound();
    }

    return <ReportsClientPage initialReports={reportData} />;
}
