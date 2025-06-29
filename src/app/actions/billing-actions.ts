'use server';

import { auth } from '@/lib/firebase';
import { adminDB } from '@/lib/firebase-admin';
import { doc, runTransaction, serverTimestamp, collection, getDoc, increment, setDoc } from 'firebase/firestore';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { type CreditPackage } from '@/lib/types';
import { getPaymentSettings } from './admin-actions';
import { headers } from 'next/headers';

interface PurchaseCreditsParams {
    userId: string;
    packageId: string;
    packageName: string;
    credits: number;
    amountPaid: number;
    paymentId: string;
}

export async function purchaseCredits(params: PurchaseCreditsParams) {
    const { currentUser } = auth;
    if (!currentUser || currentUser.uid !== params.userId) {
        throw new Error('Usuário não autenticado ou inválido.');
    }
    
    try {
        await runTransaction(adminDB, async (transaction) => {
            const userRef = doc(adminDB, 'users', params.userId);
            const salesRef = doc(adminDB, 'analytics', 'sales');

            // 1. Update user's credit balance
            transaction.update(userRef, {
                credits: increment(params.credits)
            });

            // 2. Create a transaction record in user's subcollection
            const userTransactionRef = doc(collection(userRef, 'transactions'));
            transaction.set(userTransactionRef, {
                packageId: params.packageId,
                packageName: params.packageName,
                creditsPurchased: params.credits,
                amountPaid: params.amountPaid,
                paymentId: params.paymentId,
                type: 'purchase',
                createdAt: serverTimestamp(),
            });

             // 3. Update global analytics
            transaction.set(salesRef, {
                totalRevenue: increment(params.amountPaid),
                packagesSold: increment(1),
            }, { merge: true });
        });
    } catch (error) {
        console.error('Erro na transação de compra de créditos:', error);
        throw new Error('Falha ao processar a compra.');
    }
}

interface CreatePreferenceParams {
    packageId: string;
    userId: string;
}

export async function createPaymentPreference({ packageId, userId }: CreatePreferenceParams) {
     const { currentUser } = auth;
    if (!currentUser || currentUser.uid !== userId) {
        throw new Error('Usuário não autenticado ou inválido.');
    }

    try {
        // 1. Get package and user details
        const packageRef = doc(adminDB, 'credit_packages', packageId);
        const userRef = doc(adminDB, 'users', userId);
        
        const [packageSnap, userSnap, settings] = await Promise.all([
            getDoc(packageRef),
            getDoc(userRef),
            getPaymentSettings()
        ]);

        if (!packageSnap.exists()) throw new Error('Pacote não encontrado.');
        if (!userSnap.exists()) throw new Error('Usuário não encontrado.');
        if (!settings.mercadoPago.accessToken) throw new Error('Credenciais de pagamento não configuradas.');

        const pkg = packageSnap.data() as CreditPackage;
        const user = userSnap.data();

        // 2. Configure Mercado Pago client
        const client = new MercadoPagoConfig({ accessToken: settings.mercadoPago.accessToken });
        const preference = new Preference(client);

        const origin = headers().get('origin');
        
        // 3. Create preference object
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: pkg.id,
                        title: pkg.name,
                        description: pkg.description,
                        quantity: 1,
                        unit_price: pkg.price,
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    name: user.name,
                    email: user.email,
                },
                back_urls: {
                    success: `${origin}/billing?status=success`,
                    failure: `${origin}/billing?status=failure`,
                    pending: `${origin}/billing?status=pending`,
                },
                auto_return: 'approved',
                metadata: {
                    user_id: userId,
                    package_id: packageId,
                },
            }
        });

        if (!result.id) {
            throw new Error('Falha ao criar preferência de pagamento.');
        }

        return { preferenceId: result.id };
    } catch (error) {
        console.error('Erro ao criar preferência de pagamento:', error);
        const errorMessage = (error as any)?.cause?.message || (error as Error).message;
        throw new Error(`Falha ao iniciar pagamento: ${errorMessage}`);
    }
}
