
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/loading-screen';

/**
 * This component redirects the user from the old /payments route
 * to the consolidated /admin/settings page.
 */
export default function AdminSettingsPaymentsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/settings');
    }, [router]);

    return <LoadingScreen />;
}
