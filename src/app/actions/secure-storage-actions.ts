'use server';

import { revalidatePath } from 'next/cache';

// ===== UPLOAD DE FOTOS DE PERFIL =====
export async function uploadProfilePhoto(
  file: File,
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("uploadProfilePhoto is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== UPLOAD DE LOGOS DE FROTA =====
export async function uploadFleetLogo(
  file: File,
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("uploadFleetLogo is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== UPLOAD DE GALERIA DE FROTA =====
export async function uploadFleetGallery(
  files: File[],
  userId: string,
  userName: string,
  isPublic: boolean = true,
  isAdmin: boolean = false
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("uploadFleetGallery is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== UPLOAD DE IMAGENS DE CITY TIPS =====
export async function uploadCityTipImages(
  files: File[],
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("uploadCityTipImages is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== UPLOAD DE IMAGENS DE BLOG =====
export async function uploadBlogImages(
  files: File[],
  userId: string,
  userName: string,
  isAdmin: boolean = false
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("uploadBlogImages is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== UPLOAD DE DOCUMENTOS =====
export async function uploadDocument(
  file: File,
  userId: string,
  userName: string,
  documentType: string,
  isAdmin: boolean = false
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("uploadDocument is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== UPLOAD DE IMAGENS DE VEÍCULOS =====
export async function uploadVehicleImages(
  files: File[],
  userId: string,
  userName: string,
  vehicleId: string,
  isAdmin: boolean = false
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("uploadVehicleImages is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== GERENCIAMENTO DE IMAGENS =====

/**
 * Deletar imagem com verificação de permissão
 */
export async function deleteUserImage(
  imageId: string,
  userId: string
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("deleteUserImage is deprecated as Supabase storage is removed.");
  return { success: true };
}

/**
 * Listar imagens do usuário por categoria
 */
export async function getUserImagesByCategory(
  userId: string,
  category: string
): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getUserImagesByCategory is deprecated as Supabase storage is removed.");
  return [];
}

/**
 * Listar imagens públicas por categoria
 */
export async function getPublicImagesByCategory(
  category: string,
  limit?: number
): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getPublicImagesByCategory is deprecated as Supabase storage is removed.");
  return [];
}

/**
 * Atualizar visibilidade da imagem
 */
export async function toggleImageVisibility(
  imageId: string,
  isPublic: boolean,
  userId?: string
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("toggleImageVisibility is deprecated as Supabase storage is removed.");
  return { success: true };
}

/**
 * Gerar URL assinada para imagem privada
 */
export async function getImageSignedUrl(
  imageId: string,
  expiresIn: number = 3600
): Promise<string | null> {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return null.
  console.warn("getImageSignedUrl is deprecated as Supabase storage is removed.");
  return null;
}

// ===== AÇÕES ESPECÍFICAS POR TIPO =====

/**
 * Buscar fotos de perfil do usuário
 */
export async function getUserProfilePhotos(userId: string): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getUserProfilePhotos is deprecated as Supabase storage is removed.");
  return [];
}

/**
 * Buscar imagens de galeria da frota
 */
export async function getFleetGalleryImages(
  userId: string,
  isPublic?: boolean
): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getFleetGalleryImages is deprecated as Supabase storage is removed.");
  return [];
}

/**
 * Buscar imagens públicas de city tips
 */
export async function getCityTipImages(limit?: number): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getCityTipImages is deprecated as Supabase storage is removed.");
  return [];
}

/**
 * Buscar imagens de blog
 */
export async function getBlogImages(limit?: number): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getBlogImages is deprecated as Supabase storage is removed.");
  return [];
}

/**
 * Buscar documentos do usuário
 */
export async function getUserDocuments(userId: string): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getUserDocuments is deprecated as Supabase storage is removed.");
  return [];
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
): Promise<any[]> { // Changed from ImageMetadata[] to any[] as ImageMetadata is removed
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return an empty array.
  console.warn("getAllImages is deprecated as Supabase storage is removed.");
  return [];
}

/**
 * Deletar imagem como admin
 */
export async function deleteImageAsAdmin(imageId: string) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("deleteImageAsAdmin is deprecated as Supabase storage is removed.");
  return { success: true };
}

/**
 * Atualizar visibilidade como admin
 */
export async function updateImageVisibilityAsAdmin(
  imageId: string,
  isPublic: boolean
) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("updateImageVisibilityAsAdmin is deprecated as Supabase storage is removed.");
  return { success: true };
}

// ===== SISTEMA DE CRÉDITOS =====

/**
 * Obter estatísticas de créditos do usuário
 */
export async function getUserCreditStats(userId: string) {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("getUserCreditStats is deprecated as Supabase storage is removed.");
  return { success: true };
}

/**
 * Adicionar créditos ao usuário (apenas admin)
 */
export async function addUserCredits(
  userId: string,
  creditsToAdd: number
): Promise<{ success: boolean; error?: string }> {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("addUserCredits is deprecated as Supabase storage is removed.");
  return { success: true };
}

/**
 * Remover créditos do usuário (apenas admin)
 */
export async function removeUserCredits(
  userId: string,
  creditsToRemove: number
): Promise<{ success: boolean; error?: string }> {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("removeUserCredits is deprecated as Supabase storage is removed.");
  return { success: true };
}
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
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("canUserUpload is deprecated as Supabase storage is removed.");
  return {
    canUpload: true, // Assuming always true for now
    creditsRequired: 0,
    currentCredits: 0,
    freeLimit: 0,
    currentCount: 0,
    error: "Upload logic removed."
  };
}

/**
 * Obter estatísticas de uso de créditos (apenas admin)
 */
export async function getCreditUsageStats(): Promise<{
  totalCreditsUsed: number;
  creditsByCategory: Record<string, number>;
  topUsers: Array<{ userId: string; userName: string; creditsUsed: number }>;
}> {
  // This function is no longer directly related to Supabase storage,
  // as the storage logic has been removed.
  // For now, we'll just return a placeholder success.
  // In a real scenario, this would involve a different storage mechanism.
  console.warn("getCreditUsageStats is deprecated as Supabase storage is removed.");
  return {
    totalCreditsUsed: 0,
    creditsByCategory: {},
    topUsers: []
  };
} 