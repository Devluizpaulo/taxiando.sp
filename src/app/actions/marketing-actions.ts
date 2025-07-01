
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp as AdminTimestamp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { type Coupon, type Notification, type UserProfile, type Partner } from '@/lib/types';
import { auth } from '@/lib/firebase';


export async function createCoupon(couponData: Omit<Coupon, 'id' | 'createdAt' | 'uses'>) {
    try {
        await adminDB.collection('coupons').add({
            ...couponData,
            uses: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        revalidatePath('/admin/marketing/coupons');
        return { success: true, message: 'Cupom criado com sucesso!' };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


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

// Helper to get all coupons for the admin panel
export async function getAllCoupons(): Promise<Coupon[]> {
    try {
        const couponsCollection = adminDB.collection('coupons');
        const q = couponsCollection.orderBy('createdAt', 'desc');
        const querySnapshot = await q.get();
        
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

// Partner/Sponsor Actions
export async function createPartner(partnerData: Omit<Partner, 'id' | 'createdAt'>) {
    try {
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
        return [];
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

export interface SendNewsletterParams {
    subject: string;
    content: string;
    targetAudience: 'all' | 'drivers' | 'fleets' | 'providers';
}

export async function sendNewsletter({ subject, content, targetAudience }: SendNewsletterParams) {
    try {
        // In a real application, you would fetch user emails based on the target audience
        // and use an email service provider (like SendGrid, Mailgun, AWS SES) to send the emails.
        // For this demo, we'll just log the action.

        const userQuery = targetAudience === 'all' 
            ? adminDB.collection('users') 
            : adminDB.collection('users').where('role', '==', targetAudience);

        const usersSnapshot = await userQuery.get();
        const userCount = usersSnapshot.size;

        if (userCount === 0) {
            return { success: false, error: 'Nenhum usuário encontrado para este público-alvo.' };
        }
        
        // This is where you would loop through users and send emails.
        // For example:
        // for (const userDoc of usersSnapshot.docs) {
        //     const user = userDoc.data();
        //     await emailService.send({ to: user.email, subject, html: content });
        // }

        return { success: true, message: `Newsletter enviada com sucesso para ${userCount} destinatários.` };
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
