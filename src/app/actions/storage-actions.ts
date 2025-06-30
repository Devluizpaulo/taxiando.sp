'use server';

import { getStorage } from 'firebase-admin/storage';
import { nanoid } from 'nanoid';

// This action handles uploading a data URL to Firebase Storage using the Admin SDK.
// This bypasses client-side CORS issues.
export async function uploadImageFromDataUrl(dataUrl: string, path: string): Promise<{ success: true; url: string } | { success: false; error: string }> {
    try {
        // Use the default bucket associated with the project.
        // Ensure your service account has "Storage Object Admin" role.
        const bucket = getStorage().bucket('taxiandosp-519b1.appspot.com');

        // Extract content type and base64 data from dataUrl
        const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.*)$/);
        if (!match) {
            return { success: false, error: 'Invalid data URL format.' };
        }

        const contentType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate a unique file name to prevent collisions
        const fileName = `${nanoid()}.png`;
        const filePath = `${path}/${fileName}`;
        const file = bucket.file(filePath);

        // Save the buffer to the bucket and make it public
        await file.save(buffer, {
            metadata: {
                contentType: contentType,
            },
            public: true, // This makes the file public immediately on upload
        });
        
        // Construct the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        return { success: true, url: publicUrl };

    } catch (error) {
        console.error('Error uploading image from data URL:', error);
        return { success: false, error: (error as Error).message };
    }
}
