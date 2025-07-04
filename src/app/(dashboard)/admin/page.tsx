
'use client';

import { AdminDashboardClient } from './admin-dashboard-client';
import AdminLayout from './layout';

export default function AdminPage() {
    return (
      <AdminLayout>
        <AdminDashboardClient />
      </AdminLayout>
    );
}
