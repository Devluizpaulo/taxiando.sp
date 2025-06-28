'use server';

import { auth, db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp, collection, writeBatch, increment } from 'firebase/firestore';

interface PurchaseCreditsParams {
    userId: string;
    packageId: string;
    packageName: string;
    credits: number;
    amountPaid: number;
}

export async function purchaseCredits(params: PurchaseCreditsParams) {
    const { currentUser } = auth;
    if (!currentUser || currentUser.uid !== params.userId) {
        throw new Error('Usuário não autenticado ou inválido.');
    }
    
    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', params.userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists()) {
                throw new Error("Usuário não encontrado.");
            }

            // 1. Update user's credit balance
            transaction.update(userRef, {
                credits: increment(params.credits)
            });

            // 2. Create a transaction record
            const transactionRef = doc(collection(userRef, 'transactions'));
            transaction.set(transactionRef, {
                packageId: params.packageId,
                packageName: params.packageName,
                creditsPurchased: params.credits,
                amountPaid: params.amountPaid,
                type: 'purchase',
                createdAt: serverTimestamp(),
            });
        });
    } catch (error) {
        console.error('Erro na transação de compra de créditos:', error);
        throw new Error('Falha ao processar a compra.');
    }
}
