
import { getAllCoupons } from '@/app/actions/marketing-actions';
import { CouponsClientPage } from './coupons-client-page';

export default async function AdminCouponsPage() {
    const coupons = await getAllCoupons();
    return <CouponsClientPage initialCoupons={coupons} />;
}
