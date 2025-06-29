
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { collection, doc, addDoc, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { type Coupon, type Notification, type UserProfile } from '@/lib/types';
import { auth } from '@/lib/firebase';


export async function createCoupon(couponData: Omit<Coupon, 'id' | 'createdAt' | 'uses'>) {
    try {
        await addDoc(collection(adminDB, 'coupons'), {
            ...couponData,
            uses: 0,
            createdAt: serverTimestamp(),
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
        await addDoc(collection(adminDB, 'notifications'), {
            ...notificationData,
            createdAt: serverTimestamp(),
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
        const userDoc = await getDoc(doc(adminDB, 'users', currentUser.uid));
        if (!userDoc.exists()) return { notifications: [], newNotificationCount: 0 };
        const userProfile = userDoc.data() as UserProfile;
        
        const q = query(
            collection(adminDB, 'notifications'), 
            where('targetAudience', 'in', ['all', userProfile.role]),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
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
        const userRef = doc(adminDB, 'users', currentUser.uid);
        await setDoc(userRef, {
            lastNotificationCheck: serverTimestamp()
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
        const couponsCollection = collection(adminDB, 'coupons');
        const q = query(couponsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                expiresAt: data.expiresAt ? (data.expiresAt as Timestamp).toDate().toISOString() : undefined,
            } as Coupon;
        });
    } catch (error) {
        console.error("Error fetching coupons: ", error);
        return [];
    }
}
