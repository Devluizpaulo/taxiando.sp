

'use server';

import { adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { type UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function partialUpdateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>) {
    if (!userId) {
        return { success: false, error: 'User ID not provided.' };
    }

    try {
        const userRef = adminDB.collection('users').doc(userId);
        
        const dataToSave: {[key: string]: any} = { ...data };

        // Convert any date objects to Timestamps for Firestore
        const dateFields: (keyof UserProfile)[] = ['cnhExpiration', 'condutaxExpiration', 'alvaraExpiration'];

        for (const field of dateFields) {
            const value = (data as Record<string, any>)[field];
            if (value && (value instanceof Date || typeof value === 'string')) {
                 dataToSave[field] = Timestamp.fromDate(new Date(value as any));
            } else if (value === null) {
                dataToSave[field] = null;
            }
        }
        
        await userRef.set(dataToSave, { merge: true });

        return { success: true };
    } catch (error) {
        console.error("Error partially updating user profile:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateSeekingRentalsStatus(userId: string, isSeeking: boolean) {
    if (!userId) {
        return { success: false, error: 'User ID not provided.' };
    }

    try {
        const userRef = adminDB.collection('users').doc(userId);
        
        await userRef.update({
            isSeekingRentals: isSeeking,
            lastSeekingRentalsCheck: Timestamp.now(),
        });

        revalidatePath('/fleet/find-drivers');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
