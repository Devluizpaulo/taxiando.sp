
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp as AdminTimestamp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { type Coupon, type Notification, type UserProfile, type Partner } from '@/lib/types';
import { auth } from '@/lib/firebase';
import * as z from 'zod';


// --- Coupon Actions ---

const couponFormSchema = z.object({
  code: z.string().min(3, "O código é obrigatório.").max(20, "Máximo de 20 caracteres.").transform(value => value.toUpperCase()),
  discountType: z.enum(['percentage', 'fixed'], { required_error: "O tipo de desconto é obrigatório."}),
  discountValue: z.coerce.number().min(0.01, "O valor do desconto é obrigatório."),
  maxUses: z.coerce.number().optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().default(true),
});
export type CouponFormValues = z.infer<typeof couponFormSchema>;


export async function createCoupon(couponData: CouponFormValues) {
    try {
        const validation = couponFormSchema.safeParse(couponData);
        if (!validation.success) return { success: false, error: 'Dados inválidos.' };

        await adminDB.collection('coupons').add({
            ...couponData,
            expiresAt: couponData.expiresAt ? AdminTimestamp.fromDate(couponData.expiresAt) : null,
            uses: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        revalidatePath('/admin/marketing/coupons');
        return { success: true, message: 'Cupom criado com sucesso!' };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getCouponById(id: string): Promise<Coupon | null> {
    try {
        const docSnap = await adminDB.collection('coupons').doc(id).get();
        if (!docSnap.exists) return null;
        
        const data = docSnap.data()!;
        return {
            ...data,
            id: docSnap.id,
            createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            expiresAt: data.expiresAt ? (data.expiresAt as AdminTimestamp).toDate().toISOString() : undefined,
            updatedAt: data.updatedAt ? (data.updatedAt as AdminTimestamp).toDate().toISOString() : undefined,
        } as Coupon;
    } catch (error) {
        return null;
    }
}

export async function updateCoupon(id: string, couponData: CouponFormValues) {
     try {
        const validation = couponFormSchema.safeParse(couponData);
        if (!validation.success) return { success: false, error: 'Dados inválidos.' };

        await adminDB.collection('coupons').doc(id).update({
            ...couponData,
            expiresAt: couponData.expiresAt ? AdminTimestamp.fromDate(couponData.expiresAt) : null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath('/admin/marketing/coupons');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateCouponStatus(couponId: string, newStatus: boolean) {
    try {
        await adminDB.collection('coupons').doc(couponId).update({ isActive: newStatus });
        revalidatePath('/admin/marketing/coupons');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteCoupon(couponId: string) {
    try {
        await adminDB.collection('coupons').doc(couponId).delete();
        revalidatePath('/admin/marketing/coupons');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getAllCoupons(): Promise<Coupon[]> {
    try {
        const couponsCollection = adminDB.collection('coupons').orderBy('createdAt', 'desc');
        const querySnapshot = await couponsCollection.get();
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
                expiresAt: data.expiresAt ? (data.expiresAt as AdminTimestamp).toDate().toISOString() : undefined,
            } as Coupon;
        });
    } catch (error) {
        return [];
    }
}


// --- Partner/Sponsor Actions ---

const partnerFormSchema = z.object({
  name: z.string().min(3, "O nome do parceiro é obrigatório."),
  imageUrl: z.string().url("A URL da imagem é obrigatória e deve ser válida."),
  linkUrl: z.string().url("A URL de destino é obrigatória e deve ser válida."),
  size: z.enum(['small', 'medium', 'large'], { required_error: "O tamanho do banner é obrigatório."}),
  isActive: z.boolean().default(true),
});
export type PartnerFormValues = z.infer<typeof partnerFormSchema>;


export async function createPartner(partnerData: PartnerFormValues) {
    try {
        const validation = partnerFormSchema.safeParse(partnerData);
        if (!validation.success) return { success: false, error: 'Dados inválidos.' };
        
        await adminDB.collection('partners').add({
            ...partnerData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        revalidatePath('/admin/marketing/partners');
        revalidatePath('/'); // Revalidate home to show new partner
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getPartnerById(id: string): Promise<Partner | null> {
    try {
        const docSnap = await adminDB.collection('partners').doc(id).get();
        if (!docSnap.exists) return null;
        
        const data = docSnap.data()!;
        return {
            ...data,
            id: docSnap.id,
            createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            updatedAt: data.updatedAt ? (data.updatedAt as AdminTimestamp).toDate().toISOString() : undefined,
        } as Partner;
    } catch (error) {
        return null;
    }
}

export async function updatePartner(id: string, partnerData: PartnerFormValues) {
    try {
        const validation = partnerFormSchema.safeParse(partnerData);
        if (!validation.success) return { success: false, error: 'Dados inválidos.' };

        await adminDB.collection('partners').doc(id).update({
            ...partnerData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        revalidatePath('/admin/marketing/partners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updatePartnerStatus(partnerId: string, newStatus: boolean) {
    try {
        await adminDB.collection('partners').doc(partnerId).update({ isActive: newStatus });
        revalidatePath('/admin/marketing/partners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deletePartner(partnerId: string) {
    try {
        await adminDB.collection('partners').doc(partnerId).delete();
        revalidatePath('/admin/marketing/partners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getAllPartners(): Promise<Partner[]> {
    try {
        const partnersCollection = adminDB.collection('partners').orderBy('createdAt', 'desc');
        const querySnapshot = await partnersCollection.get();
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            } as Partner;
        });
    } catch (error) {
        return [];
    }
}

export async function getActivePartners(): Promise<Partner[]> {
    try {
        const partnersCollection = adminDB.collection('partners')
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc');
        const querySnapshot = await partnersCollection.get();
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            } as Partner;
        });
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return []; // Gracefully fail during initial setup
        }
        console.error("Error fetching active partners: ", (error as Error).message);
        return [];
    }
}


// --- Other Marketing Actions ---

export async function sendNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>) {
     try {
        await adminDB.collection('notifications').add({
            ...notificationData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, message: 'Notificação enviada com sucesso!' };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getNotificationsForUser(): Promise<{notifications: Notification[], newNotificationCount: number}> {
    const { currentUser } = auth;
    if (!currentUser) return { notifications: [], newNotificationCount: 0 };

    try {
        const userDoc = await adminDB.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists) return { notifications: [], newNotificationCount: 0 };
        const userProfile = userDoc.data() as UserProfile;
        
        const q = adminDB.collection('notifications')
            .where('targetAudience', 'in', ['all', userProfile.role])
            .orderBy('createdAt', 'desc')
            .limit(10);

        const querySnapshot = await q.get();
        const notifications = querySnapshot.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
             } as Notification
        });

        const lastCheck = userProfile.lastNotificationCheck?.toDate() ?? new Date(0);
        const newNotificationCount = notifications.filter(n => new Date(n.createdAt) > lastCheck).length;
        
        return { notifications, newNotificationCount };
    } catch (error) {
        return { notifications: [], newNotificationCount: 0 };
    }
}

export async function markNotificationsAsRead() {
    const { currentUser } = auth;
    if (!currentUser) return { success: false, error: "Usuário não autenticado." };
    
    try {
        const userRef = adminDB.collection('users').doc(currentUser.uid);
        await userRef.set({
            lastNotificationCheck: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return { success: true };
    } catch (error) {
         return { success: false, error: (error as Error).message };
    }
}

export interface SendNewsletterParams {
    subject: string;
    content: string;
    targetAudience: 'all' | 'drivers' | 'fleets' | 'providers';
}

export async function sendNewsletter({ subject, content, targetAudience }: SendNewsletterParams) {
    try {
        const userQuery = targetAudience === 'all' 
            ? adminDB.collection('users') 
            : adminDB.collection('users').where('role', '==', targetAudience);

        const usersSnapshot = await userQuery.get();
        const userCount = usersSnapshot.size;

        if (userCount === 0) {
            return { success: false, error: 'Nenhum usuário encontrado para este público-alvo.' };
        }
        
        return { success: true, message: `Newsletter enviada com sucesso para ${userCount} destinatários.` };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
