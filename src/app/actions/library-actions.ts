

'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import { type LibraryBook } from '@/lib/types';
import { bookFormSchema, type BookFormValues } from '@/lib/library-schemas';
import { uploadDocumentFile } from './storage-actions-compat';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/firebase';
import {FieldValue} from 'firebase-admin/firestore';

export async function createOrUpdateBook(data: BookFormValues, userId: string, bookId?: string) {
    const validation = bookFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Dados inválidos.' };
    }

    try {
        let { coverImageUrl, pdfUrl, coverFile, pdfFile, ...bookData } = validation.data;

        if (coverFile) {
            const formData = new FormData();
            formData.append('file', coverFile);
            const uploadResult = await uploadDocumentFile(formData, userId, 'Usuário', 'book-cover');
            if (uploadResult.success && uploadResult.url) {
                coverImageUrl = uploadResult.url;
            } else {
                throw new Error(uploadResult.error || 'Falha no upload da capa.');
            }
        }

        if (pdfFile) {
            const formData = new FormData();
            formData.append('file', pdfFile);
            const uploadResult = await uploadDocumentFile(formData, userId, 'Usuário', 'book-pdf');
            if (uploadResult.success && uploadResult.url) {
                pdfUrl = uploadResult.url;
            } else {
                throw new Error(uploadResult.error || 'Falha no upload do PDF.');
            }
        }

        const finalData = {
            ...bookData,
            coverImageUrl,
            pdfUrl,
        };

        const docRef = bookId ? adminDB.collection('library_books').doc(bookId) : adminDB.collection('library_books').doc();
        
        if (bookId) {
            await docRef.update(finalData);
        } else {
            await docRef.set({
                ...finalData,
                id: docRef.id,
                createdAt: Timestamp.now(),
                accessCount: 0,
                averageRating: 0,
                reviewCount: 0,
            });
        }

        revalidatePath('/admin/library');
        revalidatePath('/library');
        if (bookId) revalidatePath(`/library/read/${bookId}`);

        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteBook(bookId: string) {
    if (!bookId) return { success: false, error: 'ID do livro não fornecido.' };
    try {
        await adminDB.collection('library_books').doc(bookId).delete();
        revalidatePath('/admin/library');
        revalidatePath('/library');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getAllBooks(): Promise<LibraryBook[]> {
    try {
        const snapshot = await adminDB.collection('library_books').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as LibraryBook;
        });
    } catch (error) {
        console.error("Error fetching all books:", error);
        return [];
    }
}

export async function getBookById(bookId: string): Promise<LibraryBook | null> {
    if (!bookId) return null;
    try {
        const docRef = adminDB.collection('library_books').doc(bookId);
        const doc = await docRef.get();
        if (!doc.exists) return null;

        const data = doc.data();
        if (!data) return null;

        // Increment access count
        await docRef.update({ accessCount: FieldValue.increment(1) });
        revalidatePath('/library');

        return {
            ...data,
            id: doc.id,
            accessCount: data.accessCount + 1,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as LibraryBook;
    } catch (error) {
        console.error("Error fetching book by id:", error);
        return null;
    }
}


export async function getUserBookProgress(userId: string, bookId: string) {
    if (!userId || !bookId) return null;
    try {
        const docRef = adminDB.collection('users').doc(userId).collection('library_progress').doc(bookId);
        const doc = await docRef.get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting user book progress:", error);
        return null;
    }
}


export async function updateUserBookProgress(params: { userId: string, bookId: string, currentPage: number, totalPages: number }) {
    const { userId, bookId, currentPage, totalPages } = params;
    if (!userId || !bookId) return { success: false, error: "Dados inválidos." };
    
    try {
        const docRef = adminDB.collection('users').doc(userId).collection('library_progress').doc(bookId);
        await docRef.set({
            bookId,
            currentPage,
            totalPages,
            lastReadAt: Timestamp.now(),
        }, { merge: true });

        return { success: true };
    } catch (error) {
        // Fail silently on the server, as this is a background task
        console.error("Error updating user book progress:", error);
        return { success: false, error: (error as Error).message };
    }
}
