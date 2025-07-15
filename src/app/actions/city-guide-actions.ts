
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import { type CityTip } from '@/lib/types';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';

export async function createOrUpdateTip(data: CityGuideFormValues, tipId?: string) {
    const validation = cityGuideFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Dados inválidos.' };
    }

    try {
        const docRef = tipId ? adminDB.collection('city_tips').doc(tipId) : adminDB.collection('city_tips').doc();
        const tipData = {
            ...validation.data,
            id: docRef.id,
            updatedAt: Timestamp.now(),
        };

        if (tipId) {
            await docRef.update(tipData);
        } else {
            await docRef.set({
                ...tipData,
                createdAt: Timestamp.now(),
            });
        }

        revalidatePath('/admin/city-guide');
        revalidatePath('/events');

        const finalDoc = await docRef.get();
        const finalData = { ...finalDoc.data(), id: finalDoc.id } as CityTip;

        return { success: true, tip: finalData };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteTip(tipId: string) {
    if (!tipId) return { success: false, error: 'ID da dica não fornecido.' };
    try {
        await adminDB.collection('city_tips').doc(tipId).delete();
        revalidatePath('/admin/city-guide');
        revalidatePath('/events');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getTips(target?: 'driver' | 'client'): Promise<CityTip[]> {
    try {
        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDB.collection('city_tips');
        
        if (target) {
            query = query.where('target', '==', target);
        }
        
        query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as CityTip;
        });
    } catch (error) {
        console.error("Error fetching city tips:", error);
        return [];
    }
}
