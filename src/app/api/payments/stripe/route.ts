import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPaymentSettings } from '@/app/actions/admin-actions';

export async function POST(req: NextRequest) {
  try {
    const { price, name, quantity } = await req.json();
    const settings = await getPaymentSettings();

    if (!settings.stripe?.secretKey) {
      return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 500 });
    }

    const stripe = new Stripe(settings.stripe.secretKey, { apiVersion: '2024-04-10' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name },
            unit_amount: Math.round(Number(price) * 100), // em centavos
          },
          quantity: Number(quantity),
        },
      ],
      mode: 'payment',
      success_url: 'https://taxiandosp.vercel.app/pagamento/sucesso',
      cancel_url: 'https://taxiandosp.vercel.app/pagamento/cancelado',
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 