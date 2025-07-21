import { supabase } from './supabaseClient';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload de imagem para o Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: string = 'images',
  folder: string = 'general'
): Promise<UploadResult> {
  try {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      return { success: false, error: error.message };
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Erro inesperado no upload:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Upload de múltiplas imagens
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'images',
  folder: string = 'general'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadImage(file, bucket, folder));
  return Promise.all(uploadPromises);
}

/**
 * Deletar imagem do Supabase Storage
 */
export async function deleteImage(
  url: string,
  bucket: string = 'images'
): Promise<DeleteResult> {
  try {
    // Extrair o caminho do arquivo da URL
    const urlParts = url.split('/');
    const fileName = urlParts.slice(-2).join('/'); // Pega folder/filename

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro inesperado ao deletar:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Deletar múltiplas imagens
 */
export async function deleteMultipleImages(
  urls: string[],
  bucket: string = 'images'
): Promise<DeleteResult[]> {
  const deletePromises = urls.map(url => deleteImage(url, bucket));
  return Promise.all(deletePromises);
}

/**
 * Listar imagens de um bucket/folder
 */
export async function listImages(
  bucket: string = 'images',
  folder: string = 'general'
): Promise<{ name: string; url: string }[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('Erro ao listar imagens:', error);
      return [];
    }

    return data.map(file => ({
      name: file.name,
      url: supabase.storage.from(bucket).getPublicUrl(`${folder}/${file.name}`).data.publicUrl
    }));
  } catch (error) {
    console.error('Erro inesperado ao listar:', error);
    return [];
  }
}

/**
 * Validar se uma URL é do Supabase Storage
 */
export function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co') && url.includes('storage');
}

/**
 * Extrair nome do arquivo de uma URL do Supabase
 */
export function extractFileNameFromUrl(url: string): string | null {
  if (!isSupabaseUrl(url)) return null;
  
  try {
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // folder/filename
  } catch {
    return null;
  }
} 