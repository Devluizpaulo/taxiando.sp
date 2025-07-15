
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { getPaymentSettings } from '@/app/actions/admin-actions';
import { processApprovedPayment } from '@/app/actions/billing-actions';
import { adminDB } from '@/lib/firebase-admin';
import type { CreditPackage } from '@/lib/types';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;
  
  try {
    const settings = await getPaymentSettings();
    const secret = settings.stripe?.secretKey;
    // TODO: The webhook secret should probably be stored in env vars for better security
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret || !webhookSecret) {
      throw new Error("Stripe secret key or webhook secret not configured.");
    }
    const stripe = new Stripe(secret);

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;
    const paymentId = session.id;

    if (metadata && metadata.user_id && metadata.package_id && session.amount_total) {
        const packageDoc = await adminDB.collection('credit_packages').doc(metadata.package_id).get();
        if (!packageDoc.exists) {
          console.error(`Webhook Error: Package with ID ${metadata.package_id} not found for payment ${paymentId}.`);
          return NextResponse.json({ status: 'error', message: 'Package not found' }, { status: 404 });
        }
        const pkg = packageDoc.data() as CreditPackage;
        
        await processApprovedPayment({
            userId: metadata.user_id,
            packageId: metadata.package_id,
            packageName: pkg.name,
            credits: pkg.credits,
            amountPaid: session.amount_total / 100, // Stripe amount is in cents
            paymentId,
        });
    } else {
        console.error(`Webhook Error: Missing metadata for payment ${paymentId}.`);
    }
  }

  return NextResponse.json({ received: true });
}
