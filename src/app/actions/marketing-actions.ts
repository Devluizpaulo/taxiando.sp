
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp as AdminTimestamp } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { type Coupon, type Notification, type UserProfile, type Partner } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { nanoid } from 'nanoid';


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
        console.error("Error creating coupon:", error);
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
        console.error("Error sending notification:", error);
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
        console.error("Error fetching notifications:", error);
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
         console.error("Error marking notifications as read:", error);
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
        console.error("Error fetching coupons: ", error);
        return [];
    }
}

// --- Partner Actions ---

export async function createPartner(partnerData: Omit<Partner, 'id' | 'createdAt'>) {
    try {
        const partnerId = nanoid();
        await adminDB.collection('partners').doc(partnerId).set({
            ...partnerData,
            id: partnerId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        revalidatePath('/admin/marketing/partners');
        revalidatePath('/');
        return { success: true, message: 'Parceiro criado com sucesso!' };
    } catch (error) {
        console.error("Error creating partner:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getAllPartners(): Promise<Partner[]> {
    try {
        const snapshot = await adminDB.collection('partners').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            } as Partner;
        });
    } catch (error) {
        console.error("Error fetching all partners: ", error);
        return [];
    }
}

export async function getActivePartners(): Promise<Partner[]> {
    try {
        const snapshot = await adminDB.collection('partners')
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc')
            .get();
            
        return snapshot.docs.map(doc => {
             const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as AdminTimestamp).toDate().toISOString(),
            } as Partner;
        });
    } catch (error) {
        console.error("Error fetching active partners: ", error);
        return [];
    }
}


export async function updatePartnerStatus(partnerId: string, isActive: boolean) {
    try {
        await adminDB.collection('partners').doc(partnerId).update({ isActive });
        revalidatePath('/admin/marketing/partners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Error updating partner status:", error);
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
        console.error("Error deleting partner:", error);
        return { success: false, error: (error as Error).message };
    }
}
