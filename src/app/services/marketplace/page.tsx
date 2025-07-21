
import { getActiveServices } from '@/app/actions/service-actions';
import { MarketplaceClientPage } from './marketplace-client-page';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';

export default async function ServicesMarketplacePage() {
    const services = await getActiveServices();
    
    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                <MarketplaceClientPage initialServices={services} />
            </main>
            <PublicFooter />
        </div>
    );
}
