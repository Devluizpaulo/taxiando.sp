'use server';

import { revalidatePath } from 'next/cache';
import { 
  uploadSecureImage, 
  uploadMultipleSecureImages,
  deleteSecureImage,
  getUserImages,
  getPublicImages,
  getSignedUrl,
  updateImageVisibility,
  type ImageMetadata
} from '@/lib/supabase-storage-secure';
import { supabaseServer } from '@/lib/supabaseClient';
import { CONFIG } from '@/lib/config';

// ===== UPLOAD DE FOTOS DE PERFIL =====
export async function uploadProfilePhoto(
  file: File,
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  return uploadSecureImage(file, {
    bucketType: 'private',
    folder: 'profile-photos',
    ownerId: userId,
    ownerName: userName,
    category: 'profile',
    isPublic: false, // Fotos de perfil são sempre privadas
    name: `profile_${userId}`,
    isAdmin
  });
}

// ===== UPLOAD DE LOGOS DE FROTA =====
export async function uploadFleetLogo(
  file: File,
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  return uploadSecureImage(file, {
    bucketType: 'gallery',
    folder: 'fleet-logos',
    ownerId: userId,
    ownerName: userName,
    category: 'fleet-logo',
    isPublic: true, // Logos de frota são públicos
    name: `logo_${userId}`,
    isAdmin
  });
}

// ===== UPLOAD DE GALERIA DE FROTA =====
export async function uploadFleetGallery(
  files: File[],
  userId: string,
  userName: string,
  isPublic: boolean = true,
  isAdmin: boolean = false
) {
  return uploadMultipleSecureImages(files, {
    bucketType: 'gallery',
    folder: 'fleet-gallery',
    ownerId: userId,
    ownerName: userName,
    category: 'fleet-gallery',
    isPublic,
    isAdmin
  });
}

// ===== UPLOAD DE IMAGENS DE CITY TIPS =====
export async function uploadCityTipImages(
  files: File[],
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  return uploadMultipleSecureImages(files, {
    bucketType: 'public',
    folder: 'city-tips',
    ownerId: userId,
    ownerName: userName,
    category: 'city-tips',
    isPublic: true, // City tips são sempre públicas
    isAdmin
  });
}

// ===== UPLOAD DE IMAGENS DE BLOG =====
export async function uploadBlogImages(
  files: File[],
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  return uploadMultipleSecureImages(files, {
    bucketType: 'public',
    folder: 'blog-images',
    ownerId: userId,
    ownerName: userName,
    category: 'blog',
    isPublic: true, // Imagens de blog são sempre públicas
    isAdmin
  });
}

// ===== UPLOAD DE DOCUMENTOS =====
export async function uploadDocument(
  file: File,
  userId: string,
  userName: string,
  documentType: string,
  isAdmin: boolean = false
) {
  return uploadSecureImage(file, {
    bucketType: 'private',
    folder: 'documents',
    ownerId: userId,
    ownerName: userName,
    category: `document-${documentType}`,
    isPublic: false, // Documentos são sempre privados
    name: `${documentType}_${userId}`,
    isAdmin
  });
}

// ===== UPLOAD DE IMAGENS DE VEÍCULOS =====
export async function uploadVehicleImages(
  files: File[],
  userId: string,
  userName: string,
  vehicleId: string,
  isAdmin: boolean = false
) {
  return uploadMultipleSecureImages(files, {
    bucketType: 'gallery',
    folder: 'vehicle-images',
    ownerId: userId,
    ownerName: userName,
    category: `vehicle-${vehicleId}`,
    isPublic: true, // Imagens de veículos são públicas
    isAdmin
  });
}

// ===== GERENCIAMENTO DE IMAGENS =====

/**
 * Deletar imagem com verificação de permissão
 */
export async function deleteUserImage(
  imageId: string,
  userId: string
) {
  const result = await deleteSecureImage(imageId, userId);
  
  if (result.success) {
    revalidatePath('/admin/gallery');
    revalidatePath('/profile');
    revalidatePath('/fleet/profile');
  }
  
  return result;
}

/**
 * Listar imagens do usuário por categoria
 */
export async function getUserImagesByCategory(
  userId: string,
  category: string
): Promise<ImageMetadata[]> {
  return getUserImages(userId, { category });
}

/**
 * Listar imagens públicas por categoria
 */
export async function getPublicImagesByCategory(
  category: string,
  limit?: number
): Promise<ImageMetadata[]> {
  return getPublicImages({ category, limit });
}

/**
 * Atualizar visibilidade da imagem
 */
export async function toggleImageVisibility(
  imageId: string,
  isPublic: boolean,
  userId?: string
) {
  const result = await updateImageVisibility(imageId, isPublic, userId);
  
  if (result.success) {
    revalidatePath('/admin/gallery');
    revalidatePath('/profile');
    revalidatePath('/fleet/profile');
  }
  
  return result;
}

/**
 * Gerar URL assinada para imagem privada
 */
export async function getImageSignedUrl(
  imageId: string,
  expiresIn: number = 3600
): Promise<string | null> {
  return getSignedUrl(imageId, expiresIn);
}

// ===== AÇÕES ESPECÍFICAS POR TIPO =====

/**
 * Buscar fotos de perfil do usuário
 */
export async function getUserProfilePhotos(userId: string): Promise<ImageMetadata[]> {
  return getUserImages(userId, { 
    bucketType: 'private',
    category: 'profile'
  });
}

/**
 * Buscar imagens de galeria da frota
 */
export async function getFleetGalleryImages(
  userId: string,
  isPublic?: boolean
): Promise<ImageMetadata[]> {
  return getUserImages(userId, {
    bucketType: 'gallery',
    category: 'fleet-gallery',
    isPublic
  });
}

/**
 * Buscar imagens públicas de city tips
 */
export async function getCityTipImages(limit?: number): Promise<ImageMetadata[]> {
  return getPublicImages({
    bucketType: 'public',
    category: 'city-tips',
    limit
  });
}

/**
 * Buscar imagens de blog
 */
export async function getBlogImages(limit?: number): Promise<ImageMetadata[]> {
  return getPublicImages({
    bucketType: 'public',
    category: 'blog',
    limit
  });
}

/**
 * Buscar documentos do usuário
 */
export async function getUserDocuments(userId: string): Promise<ImageMetadata[]> {
  return getUserImages(userId, {
    bucketType: 'private',
    category: 'document'
  });
}

// ===== AÇÕES DE ADMIN =====

/**
 * Listar todas as imagens (apenas admin)
 */
export async function getAllImages(
  options: {
    bucketType?: 'public' | 'private' | 'gallery';
    isPublic?: boolean;
    category?: string;
    limit?: number;
  } = {}
): Promise<ImageMetadata[]> {
  // Esta função deve ser usada apenas por admins
  // Implementar verificação de role aqui se necessário
  
  if (options.isPublic !== undefined) {
    if (options.isPublic) {
      return getPublicImages(options);
    } else {
      // Para imagens privadas, retornar vazio por segurança
      // Admins devem usar uma função específica
      return [];
    }
  }
  
  return getPublicImages(options);
}

/**
 * Deletar imagem como admin
 */
export async function deleteImageAsAdmin(imageId: string) {
  const result = await deleteSecureImage(imageId); // Sem userId = admin pode deletar
  
  if (result.success) {
    revalidatePath('/admin/gallery');
  }
  
  return result;
}

/**
 * Atualizar visibilidade como admin
 */
export async function updateImageVisibilityAsAdmin(
  imageId: string,
  isPublic: boolean
) {
  const result = await updateImageVisibility(imageId, isPublic); // Sem userId = admin pode alterar
  
  if (result.success) {
    revalidatePath('/admin/gallery');
  }
  
  return result;
}

// ===== SISTEMA DE CRÉDITOS =====

/**
 * Obter estatísticas de créditos do usuário
 */
export async function getUserCreditStats(userId: string) {
  return getUserCreditStats(userId);
}

/**
 * Adicionar créditos ao usuário (apenas admin)
 */
export async function addUserCredits(
  userId: string,
  creditsToAdd: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from('users')
      .update({ 
        credits: (await supabaseServer.from('users').select('credits').eq('uid', userId).single()).data?.credits + creditsToAdd
      })
      .eq('uid', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Remover créditos do usuário (apenas admin)
 */
export async function removeUserCredits(
  userId: string,
  creditsToRemove: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from('users')
      .update({ 
        credits: Math.max(0, (await supabaseServer.from('users').select('credits').eq('uid', userId).single()).data?.credits - creditsToRemove)
      })
      .eq('uid', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Verificar se usuário pode fazer upload
 */
export async function canUserUpload(
  userId: string,
  category: string,
  bucketType: 'public' | 'private' | 'gallery'
): Promise<{
  canUpload: boolean;
  creditsRequired: number;
  currentCredits: number;
  freeLimit: number;
  currentCount: number;
  error?: string;
}> {
  try {
    const bucketConfig = {
      public: { bucket: CONFIG.supabase.buckets.public, access: 'public' },
      private: { bucket: CONFIG.supabase.buckets.private, access: 'private' },
      gallery: { bucket: CONFIG.supabase.buckets.gallery, access: 'mixed' }
    }[bucketType];
    const uploadConfig = CONFIG.upload;
    const creditConfig = CONFIG.credits.limits[category as keyof typeof CONFIG.credits.limits];
    
    // Buscar créditos do usuário
    const { data: user } = await supabaseServer
      .from('users')
      .select('credits')
      .eq('uid', userId)
      .single();

    const currentCredits = user?.credits || 0;
    
    // Contar imagens atuais
    const { count } = await supabaseServer
      .from('image_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('category', category);

    const currentCount = count || 0;
    const creditsRequired = currentCount < creditConfig?.free || 0 ? 0 : creditConfig?.cost || 0;
    const canUpload = currentCredits >= creditsRequired;

    return {
      canUpload,
      creditsRequired,
      currentCredits,
      freeLimit: creditConfig?.free || 0,
      currentCount
    };
  } catch (error) {
    return {
      canUpload: false,
      creditsRequired: 1,
      currentCredits: 0,
      freeLimit: 0,
      currentCount: 0,
      error: (error as Error).message
    };
  }
}

/**
 * Obter estatísticas de uso de créditos (apenas admin)
 */
export async function getCreditUsageStats(): Promise<{
  totalCreditsUsed: number;
  creditsByCategory: Record<string, number>;
  topUsers: Array<{ userId: string; userName: string; creditsUsed: number }>;
}> {
  try {
    // Total de créditos usados
    const { data: totalData } = await supabaseServer
      .from('image_metadata')
      .select('credits_used');

    const totalCreditsUsed = totalData?.reduce((sum: number, img: any) => sum + (img.credits_used || 0), 0) || 0;

    // Créditos por categoria
    const { data: categoryData } = await supabaseServer
      .from('image_metadata')
      .select('category, credits_used');

    const creditsByCategory: Record<string, number> = {};
    categoryData?.forEach((img: any) => {
      creditsByCategory[img.category] = (creditsByCategory[img.category] || 0) + (img.credits_used || 0);
    });

    // Top usuários
    const { data: topUsers } = await supabaseServer
      .from('image_metadata')
      .select('owner_id, owner_name, credits_used')
      .order('credits_used', { ascending: false })
      .limit(10);

    const userStats = topUsers?.reduce((acc: Record<string, { userName: string; creditsUsed: number }>, img: any) => {
      const userId = img.owner_id;
      if (!acc[userId]) {
        acc[userId] = { userName: img.owner_name || 'Usuário', creditsUsed: 0 };
      }
      acc[userId].creditsUsed += img.credits_used || 0;
      return acc;
    }, {} as Record<string, { userId: string; userName: string; creditsUsed: number }>);

    return {
      totalCreditsUsed,
      creditsByCategory,
      topUsers: Object.entries(userStats || {}).map(([userId, { userName, creditsUsed }]) => ({ userId, userName, creditsUsed }))
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de créditos:', error);
    return {
      totalCreditsUsed: 0,
      creditsByCategory: {},
      topUsers: []
    };
  }
} 