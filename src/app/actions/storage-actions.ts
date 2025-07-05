

'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "application/pdf"];


export async function uploadFile(formData: FormData, userId: string): Promise<{success: boolean; url?: string; error?: string}> {
    const file = formData.get('file') as File | null;

    if (!file) {
        return { success: false, error: 'Nenhum arquivo fornecido.' };
    }

    if (!userId) {
        return { success: false, error: 'Usuário não autenticado para o upload.' };
    }
    
    // Basic validation for file size and type
    if (file.size > MAX_FILE_SIZE) { 
        return { success: false, error: `O arquivo é muito grande (máx ${MAX_FILE_SIZE / 1024 / 1024}MB).` };
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        return { success: false, error: 'Tipo de arquivo inválido. Apenas imagens, áudios e PDFs são permitidos.' };
    }


    const bucket = adminStorage.bucket();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExtension}`;
    
    // Organize uploads into a specific folder for each user
    const filePath = `user-uploads/${userId}/${fileName}`;
    const fileUpload = bucket.file(filePath);

    try {
        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });
        
        // IMPORTANT: For publicUrl() to work, the object needs to be public.
        // This makes the file publicly accessible to anyone with the link.
        // Ensure your bucket's IAM permissions are set correctly for this.
        await fileUpload.makePublic();
        const publicUrl = fileUpload.publicUrl();

        return { success: true, url: publicUrl };

    } catch (error) {
        return { success: false, error: 'Não foi possível fazer o upload do arquivo.' };
    }
}
