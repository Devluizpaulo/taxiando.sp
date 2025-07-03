'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import { type QuizData } from '@/lib/types';
import { quizFormSchema, type QuizFormValues } from '@/lib/quiz-schemas';

// --- Actions ---

export async function createQuiz(values: QuizFormValues) {
    try {
        const validation = quizFormSchema.safeParse(values);
        if (!validation.success) {
            return { success: false, error: 'Dados inválidos.' };
        }
        
        const quizRef = adminDB.collection('quizzes').doc();
        await quizRef.set({
            ...validation.data,
            id: quizRef.id,
            status: 'Draft',
            createdAt: Timestamp.now(),
        });
        
        revalidatePath('/admin/marketing/quiz');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function updateQuiz(quizId: string, values: QuizFormValues) {
    try {
        const validation = quizFormSchema.safeParse(values);
        if (!validation.success) {
            return { success: false, error: 'Dados inválidos.' };
        }
        
        const quizRef = adminDB.collection('quizzes').doc(quizId);
        await quizRef.update({
            ...validation.data,
            updatedAt: Timestamp.now(),
        });

        revalidatePath('/admin/marketing/quiz');
        revalidatePath('/'); // Revalidate home page if this quiz was active
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getAllQuizzes(): Promise<QuizData[]> {
    try {
        const snapshot = await adminDB.collection('quizzes').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as QuizData;
        });
    } catch (error) {
        return [];
    }
}

export async function deleteQuiz(quizId: string) {
    try {
        await adminDB.collection('quizzes').doc(quizId).delete();
        revalidatePath('/admin/marketing/quiz');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function setActiveQuiz(quizId: string) {
    try {
        const batch = adminDB.batch();
        const quizzesRef = adminDB.collection('quizzes');
        
        // 1. Set all other quizzes to 'Draft'
        const snapshot = await quizzesRef.where('status', '==', 'Active').get();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'Draft' });
        });
        
        // 2. Set the selected quiz to 'Active'
        const newActiveQuizRef = quizzesRef.doc(quizId);
        batch.update(newActiveQuizRef, { status: 'Active' });
        
        await batch.commit();
        
        revalidatePath('/admin/marketing/quiz');
        revalidatePath('/'); // Revalidate home page
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function getActiveQuiz(): Promise<QuizData | null> {
    try {
        const snapshot = await adminDB.collection('quizzes')
            .where('status', '==', 'Active')
            .limit(1)
            .get();
            
        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as QuizData;

    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return null;
        }
        console.error("Error fetching active quiz: ", (error as Error).message);
        return null;
    }
}
