

'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import type { Review, UserProfile } from '@/lib/types';
import * as z from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "O comentário deve ter pelo menos 10 caracteres.").max(500, "O comentário deve ter no máximo 500 caracteres."),
  reviewerId: z.string(),
  reviewerName: z.string(),
  reviewerRole: z.enum(['driver', 'fleet', 'provider', 'admin']),
  revieweeId: z.string(),
  revieweeRole: z.enum(['driver', 'fleet', 'provider', 'admin']),
  relatedTo: z.string().optional(),
  relatedToName: z.string().optional(),
});

export async function createReview(data: z.infer<typeof reviewSchema>) {
    const validation = reviewSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: "Dados da avaliação inválidos." };
    }
    try {
        const reviewRef = adminDB.collection('reviews').doc();
        const reviewData: Omit<Review, 'id' | 'createdAt' | 'status'> = validation.data;
        
        await reviewRef.set({
            ...reviewData,
            id: reviewRef.id,
            status: 'pending',
            createdAt: Timestamp.now(),
        });

        revalidatePath('/fleet');
        revalidatePath('/applications');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getPendingReviews(): Promise<Review[]> {
    try {
        const snapshot = await adminDB.collection('reviews').where('status', '==', 'pending').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as Review;
        });
    } catch (error) {
        console.error("Error fetching pending reviews:", error);
        return [];
    }
}

export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected') {
    const reviewRef = adminDB.collection('reviews').doc(reviewId);

    try {
        if (status === 'approved') {
            await adminDB.runTransaction(async (transaction) => {
                const reviewDoc = await transaction.get(reviewRef);
                if (!reviewDoc.exists) throw new Error("Avaliação não encontrada.");
                
                const reviewData = reviewDoc.data() as Review;
                const revieweeRef = adminDB.collection('users').doc(reviewData.revieweeId);
                const revieweeDoc = await transaction.get(revieweeRef);
                if (!revieweeDoc.exists) throw new Error("Usuário avaliado não encontrado.");

                const revieweeProfile = revieweeDoc.data() as UserProfile;
                const currentTotalRating = (revieweeProfile.averageRating || 0) * (revieweeProfile.reviewCount || 0);
                const newReviewCount = (revieweeProfile.reviewCount || 0) + 1;
                const newAverageRating = (currentTotalRating + reviewData.rating) / newReviewCount;
                
                transaction.update(reviewRef, { status: 'approved' });
                transaction.update(revieweeRef, {
                    averageRating: newAverageRating,
                    reviewCount: newReviewCount,
                });
            });
        } else {
            // Se rejeitado, podemos querer decrementar a contagem se já foi aprovado por engano
            // Por simplicidade, apenas atualizamos o status.
            await reviewRef.update({ status: 'rejected' });
        }
        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error) {
        console.error("Error updating review status:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getReviewsForUser(userId: string): Promise<Review[]> {
    if (!userId) return [];
    try {
        const snapshot = await adminDB.collection('reviews')
            .where('revieweeId', '==', userId)
            .where('status', '==', 'approved')
            .orderBy('createdAt', 'desc')
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as Review;
        });
    } catch (error) {
        console.error("Error fetching reviews for user:", error);
        return [];
    }
}
