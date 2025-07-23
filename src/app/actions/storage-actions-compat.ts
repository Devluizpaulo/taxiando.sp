'use server';

import { uploadProfilePhoto, uploadFleetLogo, uploadFleetGallery, uploadDocument } from './secure-storage-actions';

/**
 * Wrapper de compatibilidade para migração gradual
 * Mantém a interface antiga enquanto migra para o novo sistema
 */
export async function uploadFile(formData: FormData, userId: string): Promise<{success: boolean; url?: string; error?: string}> {
    const file = formData.get('file') as File | null;

    if (!file) {
        return { success: false, error: 'Nenhum arquivo fornecido.' };
    }

    if (!userId) {
        return { success: false, error: 'Usuário não autenticado para o upload.' };
    }

    try {
        // Determinar o tipo de upload baseado no contexto
        // Por padrão, usar upload de perfil (mais comum)
        const result = await uploadProfilePhoto(file, userId, 'Usuário', false);
        
        return {
            success: result.success
        };
    } catch (error) {
        return { 
            success: false, 
            error: 'Erro durante o upload. Tente novamente.' 
        };
    }
}

/**
 * Upload específico para fotos de perfil
 */
export async function uploadProfileFile(formData: FormData, userId: string, userName: string): Promise<{success: boolean; url?: string; error?: string}> {
    const file = formData.get('file') as File | null;

    if (!file) {
        return { success: false, error: 'Nenhum arquivo fornecido.' };
    }

    try {
        const result = await uploadProfilePhoto(file, userId, userName, false);
        
        return {
            success: result.success
        };
    } catch (error) {
        return { 
            success: false, 
            error: 'Erro durante o upload da foto de perfil.' 
        };
    }
}

/**
 * Upload específico para logos de frota
 */
export async function uploadFleetLogoFile(formData: FormData, userId: string, userName: string): Promise<{success: boolean; url?: string; error?: string}> {
    const file = formData.get('file') as File | null;

    if (!file) {
        return { success: false, error: 'Nenhum arquivo fornecido.' };
    }

    try {
        const result = await uploadFleetLogo(file, userId, userName, false);
        
        return {
            success: result.success
        };
    } catch (error) {
        return { 
            success: false, 
            error: 'Erro durante o upload do logo.' 
        };
    }
}

/**
 * Upload específico para galeria de frota
 */
export async function uploadFleetGalleryFiles(files: File[], userId: string, userName: string, isPublic: boolean = true): Promise<{success: boolean; urls?: string[]; error?: string}> {
    if (!files || files.length === 0) {
        return { success: false, error: 'Nenhum arquivo fornecido.' };
    }

    try {
        const result = await uploadFleetGallery(files, userId, userName, isPublic, false);
        if (!result.success) {
            return {
                success: false,
                error: 'Nenhum arquivo foi enviado com sucesso.'
            };
        }
        return {
            success: true
        };
    } catch (error) {
        return { 
            success: false, 
            error: 'Erro durante o upload da galeria.' 
        };
    }
}

/**
 * Upload específico para documentos
 */
export async function uploadDocumentFile(formData: FormData, userId: string, userName: string, documentType: string): Promise<{success: boolean; url?: string; error?: string}> {
    const file = formData.get('file') as File | null;

    if (!file) {
        return { success: false, error: 'Nenhum arquivo fornecido.' };
    }

    try {
        const result = await uploadDocument(file, userId, userName, documentType, false);
        
        return {
            success: result.success
        };
    } catch (error) {
        return { 
            success: false, 
            error: 'Erro durante o upload do documento.' 
        };
    }
} 