

'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { type BlogPost } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { type BlogPostFormValues } from '@/lib/blog-schemas';
import { cleanFirestoreData } from '@/lib/utils';


export async function createBlogPost(values: BlogPostFormValues, authorId: string, authorName: string) {
    if (!authorId) {
        return { success: false, error: 'Usuário não autenticado.' };
    }
    
    try {
        const postRef = adminDB.collection('blog_posts').doc();
        const postData: Omit<BlogPost, 'id' | 'imageFile'> = {
            ...values,
            authorId: authorId,
            authorName: authorName,
            createdAt: Timestamp.now().toDate().toISOString(),
            updatedAt: Timestamp.now().toDate().toISOString(),
        };

        await postRef.set(postData);

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        revalidatePath(`/blog/${values.slug}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateBlogPost(postId: string, values: BlogPostFormValues) {
    if (!postId) {
        return { success: false, error: 'ID do post não fornecido.' };
    }

    try {
        const postRef = adminDB.collection('blog_posts').doc(postId);
        await postRef.update({
            ...values,
            updatedAt: Timestamp.now().toDate().toISOString(),
        });

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        revalidatePath(`/blog/${values.slug}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteBlogPost(postId: string) {
    if (!postId) {
        return { success: false, error: 'ID do post não fornecido.' };
    }
    try {
        await adminDB.collection('blog_posts').doc(postId).delete();
        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    try {
        const snapshot = await adminDB.collection('blog_posts').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const cleanedData = cleanFirestoreData(data);
            return {
                ...cleanedData,
                id: doc.id,
            } as BlogPost;
        });
    } catch (error) {
        console.error("Error fetching all blog posts:", error);
        return [];
    }
}

export async function getPublishedBlogPosts(postLimit?: number): Promise<BlogPost[]> {
    try {
        let query = adminDB.collection('blog_posts')
            .where('status', '==', 'Published')
            .orderBy('createdAt', 'desc');
        
        if (postLimit) {
            query = query.limit(postLimit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const cleanedData = cleanFirestoreData(data);
            return {
                ...cleanedData,
                id: doc.id,
            } as BlogPost;
        });
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return []; // Gracefully fail during initial setup
        }
        console.error("Error fetching published blog posts: ", (error as Error).message);
        return [];
    }
}

export async function getBlogPostById(postId: string): Promise<BlogPost | null> {
    try {
        const doc = await adminDB.collection('blog_posts').doc(postId).get();
        if (!doc.exists) return null;
        
        const data = doc.data()!;
        const cleanedData = cleanFirestoreData(data);
        return {
            ...cleanedData,
            id: doc.id,
        } as BlogPost;
    } catch (error) {
        return null;
    }
}


export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const snapshot = await adminDB.collection('blog_posts')
            .where('slug', '==', slug)
            .where('status', '==', 'Published')
            .limit(1)
            .get();
            
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        const data = doc.data();
        const cleanedData = cleanFirestoreData(data);
        return {
            ...cleanedData,
            id: doc.id,
        } as BlogPost;
    } catch (error) {
        return null;
    }
}
