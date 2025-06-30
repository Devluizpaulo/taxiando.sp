
'use server';

import { adminStorage } from '@/lib/firebase-admin';
import { nanoid } from 'nanoid';

export async function uploadFile(formData: FormData): Promise<{success: boolean; url?: string; error?: string}> {
    const file = formData.get('file') as File | null;

    if (!file) {
        return { success: false, error: 'Nenhum arquivo fornecido.' };
    }
    
    // Basic validation for file size and type
    if (file.size > 5 * 1024 * 1024) { // 5MB
        return { success: false, error: 'O arquivo é muito grande (máx 5MB).' };
    }
    if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Tipo de arquivo inválido. Apenas imagens são permitidas.' };
    }


    const bucket = adminStorage.bucket();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExtension}`;
    
    // We'll store public user uploads in a specific folder
    const fileUpload = bucket.file(`user-uploads/${fileName}`);

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
        console.error('Error uploading file to Firebase Storage:', error);
        return { success: false, error: 'Não foi possível fazer o upload do arquivo.' };
    }
}
