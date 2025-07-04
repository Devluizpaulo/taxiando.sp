
'use server';

import { auth } from '@/lib/firebase';
import { adminDB, Timestamp as AdminTimestamp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { type CreditPackage, type Coupon } from '@/lib/types';
import { getPaymentSettings } from './admin-actions';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import * as z from 'zod';


// Schema for package creation and update
const packageFormSchema = z.object({
  name: z.string().min(3, "O nome do pacote é obrigatório."),
  description: z.string().min(10, "A descrição é obrigatória."),
  credits: z.coerce.number().min(1, "O pacote deve dar pelo menos 1 crédito."),
  price: z.coerce.number().min(0.5, "O preço é obrigatório."),
  priceId: z.string().min(3, "O ID do Preço do Mercado Pago é obrigatório."),
  popular: z.boolean().default(false),
});
export type PackageFormValues = z.infer<typeof packageFormSchema>;


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

export async function purchaseCredits(params: PurchaseCreditsParams) {
    const { currentUser } = auth;
    if (!currentUser || currentUser.uid !== params.userId) {
        throw new Error('Usuário não autenticado ou inválido.');
    }
    
    try {
        await adminDB.runTransaction(async (transaction) => {
            const userRef = adminDB.collection('users').doc(params.userId);
            const salesRef = adminDB.collection('analytics').doc('sales');

            // 1. Update user's credit balance
            transaction.update(userRef, {
                credits: admin.firestore.FieldValue.increment(params.credits)
            });

            // 2. Create a transaction record in user's subcollection
            const userTransactionRef = userRef.collection('transactions').doc();
            transaction.set(userTransactionRef, {
                packageId: params.packageId,
                packageName: params.packageName,
                creditsPurchased: params.credits,
                amountPaid: params.amountPaid,
                paymentId: params.paymentId,
                type: 'purchase',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

             // 3. Update global analytics
            transaction.set(salesRef, {
                totalRevenue: admin.firestore.FieldValue.increment(params.amountPaid),
                packagesSold: admin.firestore.FieldValue.increment(1),
            }, { merge: true });
        });
    } catch (error) {
        throw new Error('Falha ao processar a compra.');
    }
}

interface CreatePreferenceParams {
    packageId: string;
    userId: string;
    couponCode?: string;
}

type CreatePreferenceResult = {
    success: true;
    preferenceId: string;
    discountApplied?: {
        code: string;
        description: string;
    }
} | {
    success: false;
    error: string;
}


export async function createPaymentPreference({ packageId, userId, couponCode }: CreatePreferenceParams): Promise<CreatePreferenceResult> {
     const { currentUser } = auth;
    if (!currentUser || currentUser.uid !== userId) {
        return { success: false, error: 'Usuário não autenticado ou inválido.' };
    }

    try {
        const packageRef = adminDB.collection('credit_packages').doc(packageId);
        const userRef = adminDB.collection('users').doc(userId);
        
        const [packageSnap, userSnap, settings] = await Promise.all([
            packageRef.get(),
            userRef.get(),
            getPaymentSettings()
        ]);

        if (!packageSnap.exists) return { success: false, error: 'Pacote não encontrado.' };
        if (!userSnap.exists) return { success: false, error: 'Usuário não encontrado.' };
        if (!settings.mercadoPago.accessToken) return { success: false, error: 'Credenciais de pagamento não configuradas.' };

        const pkg = packageSnap.data() as CreditPackage;
        const user = userSnap.data();
        let finalPrice = pkg.price;
        let discountApplied;

        if (couponCode) {
            const couponQuery = await adminDB.collection('coupons').where('code', '==', couponCode).limit(1).get();
            if (!couponQuery.empty) {
                const couponDoc = couponQuery.docs[0];
                const coupon = couponDoc.data() as Coupon;
                const expiresAt = coupon.expiresAt ? (coupon.expiresAt as AdminTimestamp).toDate() : null;

                if (coupon.isActive && (!expiresAt || expiresAt > new Date()) && (coupon.maxUses === undefined || coupon.uses < coupon.maxUses)) {
                    if (coupon.discountType === 'percentage') {
                        finalPrice = pkg.price * (1 - coupon.discountValue / 100);
                        discountApplied = { code: coupon.code, description: `${coupon.discountValue}% OFF` };
                    } else if (coupon.discountType === 'fixed') {
                        finalPrice = Math.max(0, pkg.price - coupon.discountValue);
                        discountApplied = { code: coupon.code, description: `R$ ${coupon.discountValue.toFixed(2)} OFF` };
                    }
                } else {
                     return { success: false, error: 'Cupom inválido ou expirado.' };
                }
            } else {
                 return { success: false, error: 'Cupom não encontrado.' };
            }
        }
        
        finalPrice = parseFloat(finalPrice.toFixed(2));

        const client = new MercadoPagoConfig({ accessToken: settings.mercadoPago.accessToken });
        const preference = new Preference(client);
        const origin = headers().get('origin');
        
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: pkg.id,
                        title: pkg.name,
                        description: discountApplied ? `Com cupom: ${discountApplied.code}` : pkg.description,
                        quantity: 1,
                        unit_price: finalPrice,
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
                    coupon_applied: discountApplied?.code || null,
                },
            }
        });

        if (!result.id) {
            return { success: false, error: 'Falha ao criar preferência de pagamento.' };
        }

        return { success: true, preferenceId: result.id, discountApplied };
    } catch (error) {
        const errorMessage = (error as any)?.cause?.message || (error as Error).message;
        return { success: false, error: `Falha ao iniciar pagamento: ${errorMessage}` };
    }
}
