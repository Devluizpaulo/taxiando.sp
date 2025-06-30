
import { getAvailableVehicles } from '@/app/actions/fleet-actions';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { RentalsClientPage } from './rentals-client-page';

export default async function RentalsPage() {
    const allVehicles = await getAvailableVehicles();

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <RentalsClientPage initialVehicles={allVehicles} />
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
