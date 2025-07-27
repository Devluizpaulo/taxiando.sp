
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import { type CityTip, type CityTipReview } from '@/lib/types';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { generateCityTip, type GenerateCityTipInput } from '@/ai/flows/generate-city-tip-flow';

export async function generateTipWithAI(input: GenerateCityTipInput) {
    try {
        const result = await generateCityTip(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating tip with AI:', error);
        return { success: false, error: (error as Error).message };
    }
}

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
        revalidatePath('/spdicas');

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
        revalidatePath('/spdicas');
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
            
            // Função helper para converter Timestamp para string ISO
            const convertTimestamp = (timestamp: any): string => {
                if (timestamp && typeof timestamp.toDate === 'function') {
                    return timestamp.toDate().toISOString();
                } else if (typeof timestamp === 'string') {
                    return timestamp;
                } else if (timestamp && timestamp._seconds) {
                    // Fallback para objetos Timestamp serializados
                    return new Date(timestamp._seconds * 1000).toISOString();
                }
                return new Date().toISOString();
            };

            // Ensure all required fields are present and correctly typed.
            return {
                id: doc.id,
                title: data.title || '',
                category: data.category || 'General',
                description: data.description || '',
                location: data.location || '',
                imageUrls: data.imageUrls || [],
                mapUrl: data.mapUrl,
                target: data.target || 'driver',
                priceRange: data.priceRange,
                createdAt: convertTimestamp(data.createdAt),
                updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined,
                destaque: data.destaque === true,
            } as CityTip;
        });
    } catch (error) {
        console.error("Error fetching city tips:", error);
        return [];
    }
}

// Nova função para buscar todas as dicas para a página pública
export async function getAllTips(): Promise<CityTip[]> {
    try {
        const snapshot = await adminDB.collection('city_tips').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Função helper para converter Timestamp para string ISO
            const convertTimestamp = (timestamp: any): string => {
                if (timestamp && typeof timestamp.toDate === 'function') {
                    return timestamp.toDate().toISOString();
                } else if (typeof timestamp === 'string') {
                    return timestamp;
                } else if (timestamp && timestamp._seconds) {
                    // Fallback para objetos Timestamp serializados
                    return new Date(timestamp._seconds * 1000).toISOString();
                }
                return new Date().toISOString();
            };

            // No retorno de cada dica, inclua todos os campos:
            return {
                id: doc.id,
                title: data.title || '',
                category: data.category || 'General',
                description: data.description || '',
                location: data.location || '',
                region: data.region || '',
                imageUrls: data.imageUrls || [],
                mapUrl: data.mapUrl,
                target: data.target || 'driver',
                priceRange: data.priceRange,
                tags: data.tags || [],
                comment: data.comment || '',
                openingHours: data.openingHours || '',
                averageRating: data.averageRating || 0,
                reviewCount: data.reviewCount || 0,
                createdAt: convertTimestamp(data.createdAt),
                updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined,
                destaque: data.destaque === true,
            } as CityTip;
        });
    } catch (error) {
        console.error("Error fetching all city tips:", error);
        return [];
    }
}

// Função para adicionar uma avaliação
export async function addTipReview(
    tipId: string, 
    rating: number, 
    comment: string, 
    reviewerName: string, 
    reviewerEmail?: string,
    reviewerRole: 'driver' | 'client' | 'admin' = 'driver',
    isAnonymous: boolean = true
): Promise<{ success: boolean; error?: string }> {
    try {
        const reviewRef = adminDB.collection('city_tips').doc(tipId).collection('reviews').doc();
        const review: CityTipReview = {
            id: reviewRef.id,
            tipId,
            rating,
            comment,
            reviewerName,
            reviewerEmail,
            reviewerRole,
            createdAt: Timestamp.now().toDate().toISOString(),
            isVerified: false,
            isAnonymous
        };

        await reviewRef.set(review);

        // Atualizar estatísticas da dica
        const tipRef = adminDB.collection('city_tips').doc(tipId);
        const tipDoc = await tipRef.get();
        
        if (tipDoc.exists) {
            const tipData = tipDoc.data();
            const currentReviews = tipData?.reviewCount || 0;
            const currentRating = tipData?.averageRating || 0;
            
            // Calcular nova média
            const newReviewCount = currentReviews + 1;
            const newAverageRating = ((currentRating * currentReviews) + rating) / newReviewCount;
            
            await tipRef.update({
                reviewCount: newReviewCount,
                averageRating: Math.round(newAverageRating * 10) / 10 // Arredondar para 1 casa decimal
            });
        }

        revalidatePath('/spdicas');
        return { success: true };
    } catch (error) {
        console.error("Error adding review:", error);
        return { success: false, error: (error as Error).message };
    }
}

// Função para buscar avaliações de uma dica
export async function getTipReviews(tipId: string): Promise<CityTipReview[]> {
    try {
        const snapshot = await adminDB.collection('city_tips').doc(tipId).collection('reviews').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Função helper para converter Timestamp para string ISO
            const convertTimestamp = (timestamp: any): string => {
                if (timestamp && typeof timestamp.toDate === 'function') {
                    return timestamp.toDate().toISOString();
                } else if (typeof timestamp === 'string') {
                    return timestamp;
                } else if (timestamp && timestamp._seconds) {
                    // Fallback para objetos Timestamp serializados
                    return new Date(timestamp._seconds * 1000).toISOString();
                }
                return new Date().toISOString();
            };

            return {
                ...data,
                id: doc.id,
                createdAt: convertTimestamp(data.createdAt),
            } as CityTipReview;
        });
    } catch (error) {
        console.error("Error fetching tip reviews:", error);
        return [];
    }
}
