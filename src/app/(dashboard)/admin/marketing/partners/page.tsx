
import { getAllPartners } from '@/app/actions/marketing-actions';
import { PartnersClientPage } from './partners-client-page';

export default async function AdminPartnersPage() {
    const partners = await getAllPartners();
    return <PartnersClientPage initialPartners={partners} />;
}
