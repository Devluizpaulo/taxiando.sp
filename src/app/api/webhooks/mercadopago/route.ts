
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getPaymentSettings } from '@/app/actions/admin-actions';
import { processApprovedPayment } from '@/app/actions/billing-actions';
import { adminDB } from '@/lib/firebase-admin';
import type { CreditPackage } from '@/lib/types';


export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === 'payment') {
    const paymentId = body.data.id;

    try {
      const settings = await getPaymentSettings();
      if (!settings.mercadoPago || !settings.mercadoPago.accessToken) {
        throw new Error("Mercado Pago access token not configured.");
      }
      
      const client = new MercadoPagoConfig({ accessToken: settings.mercadoPago ? settings.mercadoPago.accessToken : '' });
      const payment = new Payment(client);
      
      const paymentInfo = await payment.get({ id: paymentId });
      
      if (paymentInfo && paymentInfo.status === 'approved') {
        const metadata = paymentInfo.metadata as { user_id: string; package_id: string; };
        const userId = metadata.user_id;
        const packageId = metadata.package_id;
        
        const packageDoc = await adminDB.collection('credit_packages').doc(packageId).get();
        if (!packageDoc.exists) {
          console.error(`Webhook Error: Package with ID ${packageId} not found for payment ${paymentId}.`);
          return NextResponse.json({ status: 'error', message: 'Package not found' }, { status: 404 });
        }
        const pkg = packageDoc.data() as CreditPackage;
        
        await processApprovedPayment({
          userId,
          packageId,
          packageName: pkg.name,
          credits: pkg.credits,
          amountPaid: paymentInfo.transaction_amount || pkg.price,
          paymentId: paymentId.toString(),
        });
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'received' }, { status: 200 });
}
