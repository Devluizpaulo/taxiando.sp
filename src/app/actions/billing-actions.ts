
'use server';

import { auth } from '@/lib/firebase';
import { adminDB, Timestamp as AdminTimestamp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import Stripe from 'stripe';
import { type CreditPackage, type Coupon } from '@/lib/types';
import { getPaymentSettings } from './admin-actions';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { packageFormSchema, type PackageFormValues } from '@/lib/billing-schemas';


// CREATE
export async function createCreditPackage(values: PackageFormValues) {
    try {
        const validation = packageFormSchema.safeParse(values);
        if (!validation.success) {
            return { success: false, error: "Dados do formulário inválidos." };
        }
        
        const packageId = nanoid();
        await adminDB.collection('credit_packages').doc(packageId).set({
            id: packageId,
            ...values,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath('/admin/billing');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// READ
export async function getCreditPackageById(packageId: string): Promise<CreditPackage | null> {
    if (!packageId) return null;
    try {
        const docRef = await adminDB.collection('credit_packages').doc(packageId).get();
        if (!docRef.exists) return null;

        const data = docRef.data()!;
        return {
            id: docRef.id,
            ...data,
            createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            updatedAt: data.updatedAt ? (data.updatedAt as AdminTimestamp).toDate().toISOString() : undefined,
        } as CreditPackage;
    } catch (error) {
        console.error("Error fetching package by ID:", error);
        return null;
    }
}


export async function getAllCreditPackages(): Promise<CreditPackage[]> {
    try {
        const packagesCollection = adminDB.collection('credit_packages');
        const q = packagesCollection.orderBy('price', 'asc');
        const querySnapshot = await q.get();
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditPackage));
    } catch (error) {
        console.error("Error fetching credit packages: ", error);
        return [];
    }
}


// UPDATE
export async function updateCreditPackage(packageId: string, values: PackageFormValues) {
    if (!packageId) return { success: false, error: 'ID do pacote não fornecido.' };

    try {
        const validation = packageFormSchema.safeParse(values);
        if (!validation.success) {
            return { success: false, error: "Dados do formulário inválidos." };
        }
        
        const packageRef = adminDB.collection('credit_packages').doc(packageId);
        await packageRef.update({
            ...values,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        revalidatePath('/admin/billing');
        revalidatePath(`/admin/billing/${packageId}/edit`);
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// DELETE
export async function deleteCreditPackage(packageId: string) {
    if (!packageId) {
        return { success: false, error: 'ID do pacote não fornecido.' };
    }
    
    try {
        await adminDB.collection('credit_packages').doc(packageId).delete();
        revalidatePath('/admin/billing');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


// --- Client-facing actions ---

interface PurchaseCreditsParams {
    userId: string;
    packageId: string;
    packageName: string;
    credits: number;
    amountPaid: number;
    paymentId: string;
}

export async function processApprovedPayment(params: PurchaseCreditsParams) {
    const { userId, packageId, packageName, credits, amountPaid, paymentId } = params;

    if (!userId || !packageId || !paymentId) {
        console.error("Process payment failed: Missing required parameters.");
        return { success: false, error: "Missing required parameters." };
    }

    try {
        const transactionResult = await adminDB.runTransaction(async (transaction) => {
            const userRef = adminDB.collection('users').doc(userId);
            const salesRef = adminDB.collection('analytics').doc('sales');
            const transactionHistoryRef = userRef.collection('transactions');

            // Idempotency Check: Verify this paymentId hasn't been processed
            const existingTransactionQuery = transactionHistoryRef.where('paymentId', '==', paymentId).limit(1);
            const existingTransactionSnap = await transaction.get(existingTransactionQuery);
            if (!existingTransactionSnap.empty) {
                console.log(`Payment ID ${paymentId} already processed. Skipping.`);
                return { success: false, error: "Payment already processed." };
            }

            // 1. Update user's credit balance
            transaction.update(userRef, {
                credits: admin.firestore.FieldValue.increment(credits)
            });

            // 2. Create a transaction record in user's subcollection
            const newTransactionRef = transactionHistoryRef.doc();
            transaction.set(newTransactionRef, {
                packageId,
                packageName,
                creditsPurchased: credits,
                amountPaid,
                paymentId,
                type: 'purchase',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

             // 3. Update global analytics
            transaction.set(salesRef, {
                totalRevenue: admin.firestore.FieldValue.increment(amountPaid),
                packagesSold: admin.firestore.FieldValue.increment(1),
            }, { merge: true });

            return { success: true };
        });

        return transactionResult;

    } catch (error) {
        console.error(`Failed to process payment ${paymentId}:`, error);
        return { success: false, error: `Failed to process payment: ${(error as Error).message}` };
    }
}


interface CreateCheckoutParams {
    packageId: string;
    userId: string;
    couponCode?: string;
}

type CreateCheckoutResult = {
    success: true;
    gateway: 'mercadoPago' | 'stripe';
    preferenceId?: string; // For Mercado Pago
    url?: string; // For Stripe
    discountApplied?: {
        code: string;
        description: string;
    }
} | {
    success: false;
    error: string;
}

export async function createCheckoutSession({ packageId, userId, couponCode }: CreateCheckoutParams): Promise<CreateCheckoutResult> {
    const { currentUser } = auth;
    if (!currentUser || currentUser.uid !== userId) {
        return { success: false, error: 'Usuário não autenticado ou inválido.' };
    }

    try {
        const settings = await getPaymentSettings();
        const packageSnap = await adminDB.collection('credit_packages').doc(packageId).get();
        if (!packageSnap.exists) return { success: false, error: 'Pacote não encontrado.' };
        const pkg = packageSnap.data() as CreditPackage;
        
        let finalPrice = pkg.price;
        let discountApplied;

        if (couponCode) {
            // Coupon logic (simplified, assuming it exists and is valid)
            // A robust implementation would check expiration, uses, etc.
             const couponQuery = await adminDB.collection('coupons').where('code', '==', couponCode).limit(1).get();
            if (!couponQuery.empty) {
                const coupon = couponQuery.docs[0].data() as Coupon;
                 if (coupon.isActive) {
                    if (coupon.discountType === 'percentage') {
                        finalPrice *= (1 - coupon.discountValue / 100);
                        discountApplied = { code: coupon.code, description: `${coupon.discountValue}% OFF` };
                    } else {
                        finalPrice = Math.max(0, finalPrice - coupon.discountValue);
                        discountApplied = { code: coupon.code, description: `R$ ${coupon.discountValue.toFixed(2)} OFF` };
                    }
                }
            }
        }
        finalPrice = parseFloat(finalPrice.toFixed(2));
        
        const origin = (await headers()).get('origin') || 'http://localhost:9002';
        
        if (settings.activeGateway === 'stripe') {
            if (!settings.stripe?.secretKey) return { success: false, error: 'Credenciais do Stripe não configuradas.' };
            
            const stripe = new Stripe(settings.stripe.secretKey);
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card', 'boleto'],
                line_items: [{
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: pkg.name,
                            description: pkg.description,
                        },
                        unit_amount: Math.round(finalPrice * 100), // Stripe expects cents
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${origin}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/billing?status=failure`,
                metadata: {
                    user_id: userId,
                    package_id: packageId,
                    coupon_applied: discountApplied?.code || '',
                }
            });
            
            if (!session.url) return { success: false, error: 'Falha ao criar sessão de checkout do Stripe.' };
            
            return { success: true, gateway: 'stripe', url: session.url, discountApplied };

        } else { // Default to Mercado Pago
            if (!settings.mercadoPago?.accessToken) return { success: false, error: 'Credenciais do Mercado Pago não configuradas.' };
            
            const client = new MercadoPagoConfig({ accessToken: settings.mercadoPago.accessToken });
            const preference = new Preference(client);
            
            const result = await preference.create({
                body: {
                    items: [{
                        id: pkg.id,
                        title: pkg.name,
                        description: discountApplied ? `Com cupom: ${discountApplied.code}` : pkg.description,
                        quantity: 1,
                        unit_price: finalPrice,
                        currency_id: 'BRL',
                    }],
                    payer: { email: currentUser.email || undefined },
                    back_urls: {
                        success: `${origin}/billing?status=success`,
                        failure: `${origin}/billing?status=failure`,
                        pending: `${origin}/billing?status=pending`,
                    },
                    auto_return: 'approved',
                    notification_url: `${origin}/api/webhooks/mercadopago`,
                    metadata: {
                        user_id: userId,
                        package_id: packageId,
                        coupon_applied: discountApplied?.code || '',
                    },
                }
            });

            if (!result.id) return { success: false, error: 'Falha ao criar preferência de pagamento.' };

            return { success: true, gateway: 'mercadoPago', preferenceId: result.id, discountApplied };
        }
    } catch (error) {
        const errorMessage = (error as any)?.cause?.message || (error as Error).message;
        return { success: false, error: `Falha ao iniciar pagamento: ${errorMessage}` };
    }
}

// --- Mercado Pago Sync ---
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * Sincroniza todos os pacotes de créditos locais com o Mercado Pago.
 * Cria ou atualiza produtos/preferências e salva o priceId no Firestore.
 */
export async function syncCreditPackagesWithMercadoPago() {
    try {
        const settings = await getPaymentSettings();
        if (!settings.mercadoPago?.accessToken) {
            throw new Error('Credenciais do Mercado Pago não configuradas.');
        }
        const client = new MercadoPagoConfig({ accessToken: settings.mercadoPago.accessToken });
        const preference = new Preference(client);

        // Busca todos os pacotes locais
        const packagesCollection = adminDB.collection('credit_packages');
        const querySnapshot = await packagesCollection.get();
        const packages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditPackage));

        for (const pkg of packages) {
            // Cria uma preferência para cada pacote (pode ser adaptado para produtos se necessário)
            const result = await preference.create({
                body: {
                    items: [{
                        id: pkg.id,
                        title: pkg.name,
                        description: pkg.description,
                        quantity: 1,
                        unit_price: pkg.price,
                        currency_id: 'BRL',
                    }],
                    metadata: {
                        package_id: pkg.id,
                    },
                }
            });
            if (result.id && pkg.priceId !== result.id) {
                // Atualiza o priceId no Firestore se mudou
                await packagesCollection.doc(pkg.id).update({ priceId: result.id });
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Erro ao sincronizar pacotes com Mercado Pago:', error);
        return { success: false, error: (error as Error).message };
    }
}
