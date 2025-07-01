
import { getAllCoupons } from '@/app/actions/marketing-actions';
import { AdminCouponsClientPage } from './coupons-client-page';

export default async function AdminCouponsPage() {
    const coupons = await getAllCoupons();
    return <AdminCouponsClientPage initialCoupons={coupons} />;
}
