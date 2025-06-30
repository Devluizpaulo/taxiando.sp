'use server';

import { revalidatePath } from 'next/cache';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { type Course, type Module } from '@/lib/types';
import { adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

interface MarkLessonAsCompleteParams {
    courseId: string;
    moduleId: string;
    lessonId: string;
}

export async function markLessonAsComplete({ courseId, moduleId, lessonId }: MarkLessonAsCompleteParams) {
    const { currentUser } = auth;
    if (!currentUser) {
        throw new Error('Usuário não autenticado.');
    }
    const userId = currentUser.uid;

    try {
        // 1. Update user's progress for the course
        const progressRef = doc(db, 'users', userId, 'progress', courseId);
        await setDoc(progressRef, {
            completedLessons: arrayUnion(lessonId)
        }, { merge: true });

        // 2. Fetch updated progress and course data to check for module completion
        const [progressSnap, courseSnap] = await Promise.all([
            getDoc(progressRef),
            getDoc(doc(db, 'courses', courseId))
        ]);

        if (!courseSnap.exists()) {
            throw new Error('Curso não encontrado.');
        }

        const courseData = courseSnap.data() as Course;
        const progressData = progressSnap.data();
        const completedLessons = progressData?.completedLessons || [];

        const targetModule = courseData.modules.find(m => m.id === moduleId);

        if (!targetModule) {
            console.warn(`Módulo ${moduleId} não encontrado no curso ${courseId}.`);
            revalidatePath(`/courses/${courseId}`);
            return;
        }

        // 3. Check if all lessons in the module are complete
        const allModuleLessonsComplete = targetModule.lessons.every(lesson =>
            completedLessons.includes(lesson.id)
        );

        // 4. If module is complete and has a badge, award it to the user
        if (allModuleLessonsComplete && targetModule.badge) {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const hasBadge = userData.earnedBadges?.some((b: {name: string}) => b.name === targetModule.badge?.name);

                if (!hasBadge) {
                     await updateDoc(userRef, {
                        earnedBadges: arrayUnion(targetModule.badge)
                    });
                }
            }
        }

        // 5. Revalidate the course page to show updated progress
        revalidatePath(`/courses/${courseId}`);

    } catch (error) {
        console.error('Erro ao marcar aula como completa:', error);
        throw new Error('Falha ao atualizar o progresso.');
    }
}

export async function getAllCourses(): Promise<Course[]> {
    try {
        const coursesCollection = adminDB.collection('courses');
        const q = coursesCollection.orderBy('createdAt', 'desc');
        const querySnapshot = await q.get();
        const coursesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt as Timestamp;
            const isoDate = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString();

            return {
                ...data,
                id: doc.id,
                createdAt: isoDate,
            } as Course;
        });
        return coursesData;
    } catch (error) {
        console.error("Error fetching courses from action: ", error);
        return [];
    }
}
