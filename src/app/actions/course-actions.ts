
'use server';

import { revalidatePath } from 'next/cache';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, deleteDoc, collection, query, orderBy } from 'firebase/firestore';
import { type Course, type Module } from '@/lib/types';
import { adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { type CourseFormValues } from '@/lib/course-schemas';
import { nanoid } from 'nanoid';

interface MarkLessonAsCompleteParams {
    courseId: string;
    moduleId: string;
    lessonId: string;
}

export async function createCourse(values: { title: string; description: string; category: string }) {
    if (!values.title || !values.description || !values.category) {
        return { success: false, error: 'Todos os campos são obrigatórios.' };
    }
    
    try {
        const courseId = nanoid();
        const courseData = {
            id: courseId,
            title: values.title,
            description: values.description,
            category: values.category,
            modules: [],
            totalLessons: 0,
            totalDuration: 0,
            createdAt: Timestamp.now(),
            status: 'Draft',
            students: 0,
        };

        await adminDB.collection('courses').doc(courseId).set(courseData);

        revalidatePath('/admin/courses');
        return { success: true, courseId: courseId };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
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
        throw new Error('Falha ao atualizar o progresso.');
    }
}

export async function getAllCourses(): Promise<Course[]> {
    try {
        const coursesSnapshot = await adminDB.collection('courses').orderBy('createdAt', 'desc').get();
        if (coursesSnapshot.empty) {
            return [];
        }

        const coursesData = coursesSnapshot.docs.map(doc => {
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
        console.error("Error fetching courses: ", (error as Error).message);
        return [];
    }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
    try {
        const courseDoc = await adminDB.collection('courses').doc(courseId).get();
        if (!courseDoc.exists) {
            return null;
        }
        const data = courseDoc.data() as any;
        
        // Convert Timestamps to ISO strings for client-side serialization
        const serializedData = {
            ...data,
            id: courseDoc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        };

        return serializedData as Course;
    } catch (error) {
        console.error("Error fetching course by ID: ", (error as Error).message);
        return null;
    }
}

export async function updateCourse(courseId: string, values: CourseFormValues) {
    if (!courseId || !values) {
        return { success: false, error: 'Dados inválidos.' };
    }
    try {
        let totalLessons = 0;
        let totalDuration = 0;

        values.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                totalLessons++;
                totalDuration += Number(lesson.duration) || 0;
            });
        });

        const courseData = {
            ...values,
            totalLessons,
            totalDuration,
        };

        const courseRef = adminDB.collection('courses').doc(courseId);
        await courseRef.update(courseData);

        revalidatePath('/admin/courses');
        revalidatePath(`/admin/courses/${courseId}/edit`);
        revalidatePath(`/courses/${courseId}`);
        return { success: true, message: 'Curso atualizado com sucesso!' };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function updateCourseStatus(courseId: string, newStatus: 'Published' | 'Draft') {
    if (!courseId || !newStatus) {
        return { success: false, error: 'Dados inválidos.' };
    }
    try {
        const courseRef = adminDB.collection('courses').doc(courseId);
        await courseRef.update({ status: newStatus });

        revalidatePath('/admin/courses');
        revalidatePath('/courses'); // Revalidate public catalog
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteCourse(courseId: string) {
    if (!courseId) {
        return { success: false, error: 'ID do curso não fornecido.' };
    }
    try {
        const courseRef = adminDB.collection('courses').doc(courseId);
        await courseRef.delete();
        
        revalidatePath('/admin/courses');
        revalidatePath('/courses');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
