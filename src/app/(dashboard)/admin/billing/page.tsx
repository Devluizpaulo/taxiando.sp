
import { getAllCreditPackages } from '@/app/actions/billing-actions';
import { BillingClientPage } from './billing-client-page';
import { type CreditPackage } from '@/lib/types';


export default async function AdminBillingPage() {
    const packages: CreditPackage[] = await getAllCreditPackages();

    return (
        <BillingClientPage initialPackages={packages} />
    );
}
