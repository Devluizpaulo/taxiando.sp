

'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import { type GalleryImage } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function getGalleryImages(userId?: string) {
    try {
        const query = userId 
            ? adminDB.collection('gallery').where('ownerId', 'in', [userId, 'admin']).orderBy('createdAt', 'desc')
            : adminDB.collection('gallery').orderBy('createdAt', 'desc');
            
        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as GalleryImage;
        });
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        return [];
    }
}

export async function uploadToGallery(
    { url, name, category, ownerId, ownerName }: Omit<GalleryImage, 'id' | 'createdAt' | 'isPublic'>,
    isPublic: boolean = false
) {
    if (!ownerId) {
        return { success: false, error: 'Usuário não autenticado.' };
    }

    try {
        const docRef = adminDB.collection('gallery').doc(nanoid());
        const galleryImageData = {
            id: docRef.id,
            url,
            name,
            category,
            ownerId,
            ownerName,
            isPublic,
            createdAt: Timestamp.now(),
        };

        await docRef.set(galleryImageData);

        revalidatePath('/admin/gallery');
        return { success: true, image: galleryImageData };

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteGalleryImage(imageId: string) {
    try {
        await adminDB.collection('gallery').doc(imageId).delete();
        revalidatePath('/admin/gallery');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateGalleryImage(imageId: string, data: { name?: string; category?: string; isPublic?: boolean }) {
    try {
        const updateData: any = { ...data };
        await adminDB.collection('gallery').doc(imageId).update(updateData);
        revalidatePath('/admin/gallery');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
