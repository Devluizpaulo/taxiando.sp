import { supabase, supabaseServer } from './supabaseClient';
import { CONFIG } from './config';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  creditsUsed?: number;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface ImageMetadata {
  id: string;
  url: string;
  name: string;
  category: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  bucket: string;
  path: string;
  size: number;
  contentType: string;
  creditsUsed: number;
  uploadedBy: 'admin' | 'user';
  createdAt: string;
}

/**
 * Verificar se usuário tem créditos suficientes
 */
async function checkUserCredits(
  userId: string,
  bucketType: 'public' | 'private' | 'gallery',
  category: string,
  isAdmin: boolean = false
): Promise<{ hasCredits: boolean; creditsRequired: number; currentCredits: number }> {
  if (isAdmin) {
    return { hasCredits: true, creditsRequired: 0, currentCredits: Infinity };
  }

  try {
    // Buscar créditos do usuário
    const { data: user, error } = await supabaseServer
      .from('users')
      .select('credits')
      .eq('uid', userId)
      .single();

    if (error || !user) {
      return { hasCredits: false, creditsRequired: 1, currentCredits: 0 };
    }

    const currentCredits = user.credits || 0;
    const bucketConfig = {
      public: { bucket: CONFIG.supabase.buckets.public, access: 'public' },
      private: { bucket: CONFIG.supabase.buckets.private, access: 'private' },
      gallery: { bucket: CONFIG.supabase.buckets.gallery, access: 'mixed' }
    }[bucketType];
    
    const uploadConfig = CONFIG.upload;
    const creditConfig = CONFIG.credits.limits[category as keyof typeof CONFIG.credits.limits];

    // Verificar se está dentro dos limites gratuitos
    const freeLimit = creditConfig?.free || 0;
    const userImageCount = await getUserImageCount(userId, category);
    
    if (userImageCount < freeLimit) {
      return { hasCredits: true, creditsRequired: 0, currentCredits };
    }

    return { 
      hasCredits: currentCredits >= (creditConfig?.cost || 0), 
      creditsRequired: creditConfig?.cost || 0, 
      currentCredits 
    };
  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    return { hasCredits: false, creditsRequired: 1, currentCredits: 0 };
  }
}

/**
 * Contar imagens do usuário por categoria
 */
async function getUserImageCount(userId: string, category: string): Promise<number> {
  try {
    const { count, error } = await supabaseServer
      .from('image_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('category', category);

    if (error) {
      console.error('Erro ao contar imagens:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Erro ao contar imagens:', error);
    return 0;
  }
}

/**
 * Deduzir créditos do usuário
 */
async function deductUserCredits(
  userId: string,
  creditsToDeduct: number
): Promise<boolean> {
  try {
    // Deduzir créditos do usuário
    const { data: userData } = await supabaseServer
      .from('users')
      .select('credits')
      .eq('uid', userId)
      .single();

    if (!userData) {
      console.error('Usuário não encontrado');
      return false;
    }

    const newCredits = Math.max(0, userData.credits - creditsToDeduct);
    
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({ credits: newCredits })
      .eq('uid', userId);

    if (updateError) {
      console.error('Erro ao deduzir créditos:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deduzir créditos:', error);
    return false;
  }
}

/**
 * Upload seguro de imagem com controle de créditos
 */
export async function uploadSecureImage(
  file: File,
  options: {
    bucketType: 'public' | 'private' | 'gallery';
    folder: string;
    ownerId: string;
    ownerName: string;
    category: string;
    isPublic?: boolean;
    name?: string;
    isAdmin?: boolean;
  }
): Promise<UploadResult> {
  const { bucketType, folder, ownerId, ownerName, category, isPublic = false, name, isAdmin = false } = options;
  const bucketConfig = {
    public: { bucket: CONFIG.supabase.buckets.public, access: 'public' },
    private: { bucket: CONFIG.supabase.buckets.private, access: 'private' },
    gallery: { bucket: CONFIG.supabase.buckets.gallery, access: 'mixed' }
  }[bucketType];
  const uploadConfig = CONFIG.upload;
  const creditConfig = CONFIG.credits.limits[category as keyof typeof CONFIG.credits.limits];

  try {
    // Validações
    if (!uploadConfig.allowedTypes.includes(file.type as any)) {
      return { 
        success: false, 
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${uploadConfig.allowedTypes.join(', ')}` 
      };
    }

    if (file.size > uploadConfig.maxFileSize) {
      return { 
        success: false, 
        error: `Arquivo muito grande. Tamanho máximo: ${uploadConfig.maxFileSize / 1024 / 1024}MB` 
      };
    }

    // Verificar créditos (apenas para usuários não-admin)
    if (!isAdmin) {
      const creditCheck = await checkUserCredits(ownerId, bucketType, category, false);
      
      if (!creditCheck.hasCredits) {
        return {
          success: false,
          error: `Créditos insuficientes. Você tem ${creditCheck.currentCredits} créditos, mas precisa de ${creditCheck.creditsRequired}.`
        };
      }
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${ownerId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucketConfig.bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Erro no upload:', error);
      return { success: false, error: error.message };
    }

    // Gerar URL baseada no tipo de acesso
    let url: string;
    if (bucketConfig.access === 'public' || (bucketConfig.access === 'mixed' && isPublic)) {
      const { data: urlData } = supabase.storage
        .from(bucketConfig.bucket)
        .getPublicUrl(fileName);
      url = urlData.publicUrl;
    } else {
      // Para arquivos privados, gerar URL assinada
      const { data: signedUrl } = await supabase.storage
        .from(bucketConfig.bucket)
        .createSignedUrl(fileName, 3600); // 1 hora
      url = signedUrl?.signedUrl || '';
    }

    // Calcular créditos utilizados
    const creditsUsed = isAdmin ? 0 : creditConfig?.cost || 0;
    const freeLimit = creditConfig?.free || 0;
    const userImageCount = await getUserImageCount(ownerId, category);
    const actualCreditsUsed = userImageCount < freeLimit ? 0 : creditsUsed;

    // Deduzir créditos se necessário
    if (!isAdmin && actualCreditsUsed > 0) {
      const deductionSuccess = await deductUserCredits(ownerId, actualCreditsUsed);
      if (!deductionSuccess) {
        // Se falhar ao deduzir créditos, deletar o arquivo
        await supabase.storage.from(bucketConfig.bucket).remove([fileName]);
        return { success: false, error: 'Erro ao processar pagamento. Tente novamente.' };
      }
    }

    // Salvar metadados no banco de dados
    const imageMetadata: Omit<ImageMetadata, 'id'> = {
      url,
      name: name || file.name,
      category,
      ownerId,
      ownerName,
      isPublic,
      bucket: bucketConfig.bucket,
      path: fileName,
      size: file.size,
      contentType: file.type,
      creditsUsed: actualCreditsUsed,
      uploadedBy: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    const { error: metadataError } = await supabaseServer
      .from('image_metadata')
      .insert(imageMetadata);

    if (metadataError) {
      console.error('Erro ao salvar metadados:', metadataError);
      // Tentar deletar o arquivo se falhar ao salvar metadados
      await supabase.storage.from(bucketConfig.bucket).remove([fileName]);
      return { success: false, error: 'Erro ao salvar informações da imagem' };
    }

    return {
      success: true,
      url,
      creditsUsed: actualCreditsUsed
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
 * Upload de múltiplas imagens seguras
 */
export async function uploadMultipleSecureImages(
  files: File[],
  options: {
    bucketType: 'public' | 'private' | 'gallery';
    folder: string;
    ownerId: string;
    ownerName: string;
    category: string;
    isPublic?: boolean;
    isAdmin?: boolean;
  }
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => 
    uploadSecureImage(file, {
      ...options,
      name: file.name
    })
  );
  return Promise.all(uploadPromises);
}

/**
 * Deletar imagem segura
 */
export async function deleteSecureImage(
  imageId: string,
  ownerId?: string
): Promise<DeleteResult> {
  try {
    // Buscar metadados da imagem
    const { data: image, error: fetchError } = await supabaseServer
      .from('image_metadata')
      .select('*')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      return { success: false, error: 'Imagem não encontrada' };
    }

    // Verificar permissão (apenas o dono ou admin pode deletar)
    if (ownerId && image.ownerId !== ownerId) {
      return { success: false, error: 'Sem permissão para deletar esta imagem' };
    }

    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from(image.bucket)
      .remove([image.path]);

    if (storageError) {
      console.error('Erro ao deletar do storage:', storageError);
      return { success: false, error: storageError.message };
    }

    // Deletar metadados
    const { error: metadataError } = await supabaseServer
      .from('image_metadata')
      .delete()
      .eq('id', imageId);

    if (metadataError) {
      console.error('Erro ao deletar metadados:', metadataError);
      return { success: false, error: metadataError.message };
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
 * Listar imagens do usuário
 */
export async function getUserImages(
  ownerId: string,
  options: {
    bucketType?: 'public' | 'private' | 'gallery';
    isPublic?: boolean;
    category?: string;
  } = {}
): Promise<ImageMetadata[]> {
  try {
    let query = supabaseServer
      .from('image_metadata')
      .select('*')
      .eq('ownerId', ownerId)
      .order('createdAt', { ascending: false });

    if (options.bucketType) {
      query = query.eq('bucket', {
        public: CONFIG.supabase.buckets.public,
        private: CONFIG.supabase.buckets.private,
        gallery: CONFIG.supabase.buckets.gallery
      }[options.bucketType]);
    }

    if (options.isPublic !== undefined) {
      query = query.eq('isPublic', options.isPublic);
    }

    if (options.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar imagens:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar imagens:', error);
    return [];
  }
}

/**
 * Listar imagens públicas
 */
export async function getPublicImages(
  options: {
    bucketType?: 'public' | 'private' | 'gallery';
    category?: string;
    limit?: number;
  } = {}
): Promise<ImageMetadata[]> {
  try {
    let query = supabaseServer
      .from('image_metadata')
      .select('*')
      .eq('isPublic', true)
      .order('createdAt', { ascending: false });

    if (options.bucketType) {
      query = query.eq('bucket', {
        public: CONFIG.supabase.buckets.public,
        private: CONFIG.supabase.buckets.private,
        gallery: CONFIG.supabase.buckets.gallery
      }[options.bucketType]);
    }

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar imagens públicas:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar imagens públicas:', error);
    return [];
  }
}

/**
 * Listar todas as imagens (apenas admin)
 */
export async function getAllImagesAsAdmin(
  options: {
    bucketType?: 'public' | 'private' | 'gallery';
    isPublic?: boolean;
    category?: string;
    limit?: number;
  } = {}
): Promise<ImageMetadata[]> {
  try {
    let query = supabaseServer
      .from('image_metadata')
      .select('*')
      .order('createdAt', { ascending: false });

    if (options.bucketType) {
      query = query.eq('bucket', {
        public: CONFIG.supabase.buckets.public,
        private: CONFIG.supabase.buckets.private,
        gallery: CONFIG.supabase.buckets.gallery
      }[options.bucketType]);
    }

    if (options.isPublic !== undefined) {
      query = query.eq('isPublic', options.isPublic);
    }

    if (options.category) {
      query = query.eq('category', options.category);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar imagens:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar imagens:', error);
    return [];
  }
}

/**
 * Gerar URL assinada para imagem privada
 */
export async function getSignedUrl(
  imageId: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data: image, error } = await supabaseServer
      .from('image_metadata')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error || !image) {
      return null;
    }

    // Se a imagem é pública, retornar URL pública
    if (image.isPublic) {
      return image.url;
    }

    // Para imagens privadas, gerar URL assinada
    const { data: signedUrl } = await supabase.storage
      .from(image.bucket)
      .createSignedUrl(image.path, expiresIn);

    return signedUrl?.signedUrl || null;
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    return null;
  }
}

/**
 * Atualizar visibilidade da imagem
 */
export async function updateImageVisibility(
  imageId: string,
  isPublic: boolean,
  ownerId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar permissão
    if (ownerId) {
      const { data: image } = await supabaseServer
        .from('image_metadata')
        .select('ownerId')
        .eq('id', imageId)
        .single();

      if (image && image.ownerId !== ownerId) {
        return { success: false, error: 'Sem permissão para alterar esta imagem' };
      }
    }

    // Atualizar visibilidade
    const { error } = await supabaseServer
      .from('image_metadata')
      .update({ isPublic })
      .eq('id', imageId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Obter estatísticas de créditos do usuário
 */
export async function getUserCreditStats(userId: string): Promise<{
  currentCredits: number;
  imagesByCategory: Record<string, number>;
  freeLimits: typeof CONFIG.credits.limits;
}> {
  try {
    // Buscar créditos atuais
    const { data: user } = await supabaseServer
      .from('users')
      .select('credits')
      .eq('uid', userId)
      .single();

    const currentCredits = user?.credits || 0;

    // Contar imagens por categoria
    const { data: images } = await supabaseServer
      .from('image_metadata')
      .select('category')
      .eq('ownerId', userId);

    const imagesByCategory: Record<string, number> = {};
    images?.forEach(img => {
      imagesByCategory[img.category] = (imagesByCategory[img.category] || 0) + 1;
    });

    return {
      currentCredits,
      imagesByCategory,
      freeLimits: CONFIG.credits.limits
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de créditos:', error);
    return {
      currentCredits: 0,
      imagesByCategory: {},
      freeLimits: CONFIG.credits.limits
    };
  }
}

/**
 * Validar se uma URL é do Supabase Storage
 */
export function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co') && url.includes('storage');
}

/**
 * Extrair informações da URL do Supabase
 */
export function parseSupabaseUrl(url: string): { bucket: string; path: string } | null {
  if (!isSupabaseUrl(url)) return null;
  
  try {
    const urlParts = url.split('/');
    const storageIndex = urlParts.findIndex(part => part === 'storage');
    if (storageIndex === -1) return null;
    
    const bucket = urlParts[storageIndex + 1];
    const path = urlParts.slice(storageIndex + 2).join('/');
    
    return { bucket, path };
  } catch {
    return null;
  }
} 