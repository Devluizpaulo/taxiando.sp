
'use server';

import { adminDB } from '@/lib/firebase-admin';
import { type CityTip, type CityTipReview } from '@/lib/types';
import { type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { generateCityTip } from '@/ai/flows/generate-city-tip-flow';

export async function createOrUpdateTip(data: CityGuideFormValues): Promise<{ success: boolean; tip?: CityTip; error?: string }> {
  try {
    const tipData = {
      title: data.title,
      description: data.description,
      location: data.location,
      region: data.region,
      imageUrls: data.imageUrls || [],
      mapUrl: data.mapUrl || '',
      target: data.target,
      tags: data.tags || [],
      comment: data.comment || '',
      tipType: data.tipType,
      
      // Campos específicos por categoria
      gastronomia: data.gastronomia,
      dayOff: data.dayOff,
      pousada: data.pousada,
      turismo: data.turismo,
      cultura: data.cultura,
      nightlife: data.nightlife,
      roteiros: data.roteiros,
      compras: data.compras,
      aventura: data.aventura,
      familia: data.familia,
      pet: data.pet,
      
      // Campos adicionais
      contributorName: data.contributorName || '',
      status: data.status || 'draft',
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDB.collection('cityTips').add(tipData);
    
    const tip: CityTip = {
      id: docRef.id,
      ...tipData,
    };

    return { success: true, tip };
  } catch (error) {
    console.error('Error creating/updating tip:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTip(id: string, data: Partial<CityGuideFormValues>): Promise<{ success: boolean; tip?: CityTip; error?: string }> {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await adminDB.collection('cityTips').doc(id).update(updateData);
    
    const doc = await adminDB.collection('cityTips').doc(id).get();
    const tip: CityTip = {
      id: doc.id,
      ...doc.data(),
    } as CityTip;

    return { success: true, tip };
  } catch (error) {
    console.error('Error updating tip:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTip(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDB.collection('cityTips').doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting tip:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getTips(): Promise<CityTip[]> {
  try {
    const snapshot = await adminDB.collection('cityTips')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as CityTip[];
  } catch (error) {
    console.error('Error getting tips:', error);
    return [];
  }
}

export async function getTipById(id: string): Promise<CityTip | null> {
  try {
    const doc = await adminDB.collection('cityTips').doc(id).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data(),
    } as CityTip;
  } catch (error) {
    console.error('Error getting tip by id:', error);
    return null;
  }
}

export async function getTipsByType(tipType: string): Promise<CityTip[]> {
  try {
    const snapshot = await adminDB.collection('cityTips')
      .where('tipType', '==', tipType)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as CityTip[];
  } catch (error) {
    console.error('Error getting tips by type:', error);
    return [];
  }
}

export async function getTipsByTarget(target: string): Promise<CityTip[]> {
  try {
    const snapshot = await adminDB.collection('cityTips')
      .where('target', '==', target)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as CityTip[];
  } catch (error) {
    console.error('Error getting tips by target:', error);
    return [];
  }
}

export async function getTipsByRegion(region: string): Promise<CityTip[]> {
  try {
    const snapshot = await adminDB.collection('cityTips')
      .where('region', '==', region)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as CityTip[];
  } catch (error) {
    console.error('Error getting tips by region:', error);
    return [];
  }
}

export async function addTipReview(tipId: string, review: Omit<CityTipReview, 'id'>): Promise<{ success: boolean; error?: string }> {
  try {
    const reviewData = {
      ...review,
      id: `${tipId}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    await adminDB.collection('cityTips').doc(tipId).collection('reviews').add(reviewData);
    
    // Atualizar média de avaliação da dica
    const reviewsSnapshot = await adminDB.collection('cityTips').doc(tipId).collection('reviews').get();
    const reviews = reviewsSnapshot.docs.map((doc: any) => doc.data() as CityTipReview);
    
    const averageRating = reviews.reduce((sum: number, r: CityTipReview) => sum + r.rating, 0) / reviews.length;
    
    await adminDB.collection('cityTips').doc(tipId).update({
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding tip review:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Função atualizada para usar a IA real do Genkit
export async function generateTipWithAI(data: { topic: string; target: 'driver' | 'client' | 'both' }): Promise<{ 
  success: boolean; 
  data?: {
    title: string;
    description: string;
    location: string;
    tags: string[];
    tipType: 'gastronomia' | 'day-off' | 'pousada' | 'turismo' | 'cultura' | 'nightlife' | 'roteiros' | 'compras' | 'aventura' | 'familia' | 'pet' | 'outro';
    specificFields?: any;
  }; 
  error?: string 
}> {
  try {
    // Usar a IA real do Genkit
    const aiResult = await generateCityTip({
      topic: data.topic,
      target: data.target,
    });

    // Mapear o resultado do Genkit para o formato esperado
    const result = {
      title: aiResult.title,
      description: aiResult.description,
      location: aiResult.location,
      tags: aiResult.tags,
      tipType: aiResult.tipType,
      specificFields: aiResult.specificFields || {}
    };

    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating tip with AI:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function publishTip(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDB.collection('cityTips').doc(id).update({
      status: 'published',
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error publishing tip:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function unpublishTip(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDB.collection('cityTips').doc(id).update({
      status: 'draft',
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error unpublishing tip:', error);
    return { success: false, error: (error as Error).message };
  }
}
