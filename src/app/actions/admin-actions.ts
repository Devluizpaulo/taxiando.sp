'use server';

import { revalidatePath } from 'next/cache';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type UserProfile } from '@/components/providers/auth-provider';

export async function updateUserProfileStatus(userId: string, newStatus: 'Aprovado' | 'Rejeitado' | 'Pendente') {
    try {
        const userRef = doc(db, 'users', userId);
        
        // Map friendly names to DB status names if needed, though they seem consistent.
        let dbStatus: UserProfile['profileStatus'] = 'pending_review';
        if (newStatus === 'Aprovado') dbStatus = 'approved';
        if (newStatus === 'Rejeitado') dbStatus = 'rejected';

        await updateDoc(userRef, { profileStatus: dbStatus });

        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error updating user profile status:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateListingStatus(
    listingId: string, 
    collectionName: 'opportunities' | 'services', 
    newStatus: 'Aprovado' | 'Rejeitado'
) {
    try {
        const listingRef = doc(db, collectionName, listingId);
        
        // For services, 'Aprovado' status from moderation should make it 'Ativo'.
        const finalStatus = collectionName === 'services' && newStatus === 'Aprovado' ? 'Ativo' : newStatus;
        
        await updateDoc(listingRef, { status: finalStatus });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error(`Error updating ${collectionName} status:`, error);
        return { success: false, error: (error as Error).message };
    }
}
