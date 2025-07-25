

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { type Course, type UserProfile } from '@/lib/types';
import { adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { type CourseFormValues } from '@/lib/course-schemas';
import { nanoid } from 'nanoid';
import { uploadFile } from './storage-actions';
import { courseFormSchema } from '@/lib/course-schemas';

interface MarkLessonAsCompleteParams {
    courseId: string;
    moduleId: string;
    lessonId: string;
    userId: string;
}

export async function createCourse(values: { title: string; description: string; category: string }, userId?: string, userName?: string) {
    // Validação robusta com Zod
    const validation = courseFormSchema.partial().safeParse(values);
    if (!validation.success) {
        // Internacionalização: mensagem em pt-BR
        return { success: false, error: 'Dados inválidos: ' + validation.error.errors.map(e => e.message).join('; ') };
    }
    // Checagem de duplicidade de título
    const existing = await adminDB.collection('courses').where('title', '==', values.title).get();
    if (!existing.empty) {
        return { success: false, error: 'Já existe um curso com este título.' };
    }
    try {
        const courseId = nanoid();
        const courseData: Omit<Course, 'id' | 'createdAt' | 'modules' | 'totalLessons' | 'totalDuration' > = {
            title: values.title,
            description: values.description,
            category: values.category,
            status: 'Draft',
            students: 0,
            difficulty: 'Iniciante',
            investmentCost: 0,
            priceInCredits: 0,
            revenue: 0,
            authorInfo: userName || '',
            legalNotice: 'Este conteúdo é protegido por direitos autorais. A reprodução não autorizada é proibida.',
        };
        await adminDB.collection('courses').doc(courseId).set({
            ...courseData,
            id: courseId,
            modules: [],
            totalLessons: 0,
            totalDuration: 0,
            createdAt: Timestamp.now(),
            createdBy: userId || null,
            createdByName: userName || null,
        });
        revalidatePath('/admin/courses');
        return { success: true, courseId: courseId };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function markLessonAsComplete({ courseId, moduleId, lessonId, userId }: MarkLessonAsCompleteParams) {
    if (!userId) {
        throw new Error('Usuário não autenticado.');
    }

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
            console.warn(`Module for lesson ${lessonId} not found in course ${courseId}. Cannot check for badge completion.`);
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

export async function updateCourse(courseId: string, values: CourseFormValues, userId: string) {
    if (!courseId || !values || !userId) {
        return { success: false, error: 'Dados inválidos ou usuário não autenticado.' };
    }
    try {
        let totalLessons = 0;
        let totalDuration = 0;

        // LOG: valor recebido de coverImageUrl
        console.log('[updateCourse] coverImageUrl recebido:', values.coverImageUrl, 'tipo:', typeof values.coverImageUrl, values.coverImageUrl instanceof File ? 'File' : 'string');

        // Upload da capa se for File
        let coverImageUrl = values.coverImageUrl;
        if (coverImageUrl instanceof File) {
            console.log('[updateCourse] Fazendo upload da capa...');
            const formData = new FormData();
            formData.append('file', coverImageUrl);
            const uploadResult = await uploadFile(formData, userId);
            if (uploadResult.success && uploadResult.url) {
                coverImageUrl = uploadResult.url;
                console.log('[updateCourse] Upload da capa OK:', coverImageUrl);
            } else {
                console.error('[updateCourse] Falha no upload da capa:', uploadResult.error);
                throw new Error(uploadResult.error || 'Falha no upload da capa.');
            }
        }

        // Handle file uploads for modules/lessons/pages/materials
        const modulesWithUploads = await Promise.all(
            values.modules.map(async (module) => {
                const lessonsWithUploads = await Promise.all(
                    module.lessons.map(async (lesson) => {
                        // Upload de arquivos de página
                        const pagesWithUploads = await Promise.all(
                            (lesson.pages || []).map(async (page) => {
                                let files = page.files || [];
                                files = await Promise.all(files.map(async (f) => {
                                    if (f instanceof File) {
                                        const formData = new FormData();
                                        formData.append('file', f);
                                        const uploadResult = await uploadFile(formData, userId);
                                        if (uploadResult.success && uploadResult.url) {
                                            return { name: f.name, url: uploadResult.url };
                                        } else {
                                            throw new Error(uploadResult.error || 'Falha no upload do arquivo da página.');
                                        }
                                    }
                                    return f;
                                }));
                                return { ...page, files };
                            })
                        );
                        // Upload de materiais
                        let materials = lesson.materials || [];
                        materials = await Promise.all(materials.map(async (m) => {
                            if (m.file instanceof File) {
                                const formData = new FormData();
                                formData.append('file', m.file);
                                const uploadResult = await uploadFile(formData, userId);
                                if (uploadResult.success && uploadResult.url) {
                                    return { name: m.name, url: uploadResult.url };
                                } else {
                                    throw new Error(uploadResult.error || 'Falha no upload do material.');
                                }
                            }
                            return m;
                        }));
                        // Upload de áudio (mantém lógica existente)
                        if (lesson.audioFile instanceof File) {
                            const formData = new FormData();
                            formData.append('file', lesson.audioFile);
                            const uploadResult = await uploadFile(formData, userId);
                            if (uploadResult.success && uploadResult.url) {
                                const { audioFile, ...restOfLesson } = lesson;
                                return { ...restOfLesson, content: uploadResult.url, pages: pagesWithUploads, materials };
                            } else {
                                throw new Error(uploadResult.error || 'Falha no upload do áudio.');
                            }
                        }
                        const { audioFile, ...restOfLesson } = lesson;
                        return { ...restOfLesson, pages: pagesWithUploads, materials };
                    })
                );
                return { ...module, lessons: lessonsWithUploads };
            })
        );
        
        const finalModules = modulesWithUploads;

        finalModules.forEach(module => {
            module.lessons.forEach(lesson => {
                totalLessons++;
                totalDuration += Number(lesson.duration) || 0;
            });
        });

        const courseData = {
            ...values,
            coverImageUrl,
            modules: finalModules,
            totalLessons,
            totalDuration,
        };

        // LOG: objeto final a ser salvo
        console.log('[updateCourse] Salvando courseData:', courseData);

        const courseRef = adminDB.collection('courses').doc(courseId);
        await courseRef.update(courseData);

        revalidatePath('/admin/courses');
        revalidatePath(`/admin/courses/${courseId}/edit`);
        revalidatePath(`/courses/${courseId}`);
        return { success: true, message: 'Curso atualizado com sucesso!' };
    } catch (error) {
        console.error('[updateCourse] Erro:', error);
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

export async function getCourseAccessData(courseId: string, userId: string) {
    if (!courseId || !userId) return { success: false, error: 'Dados inválidos.' };

    try {
        const courseDocRef = adminDB.collection('courses').doc(courseId);
        const progressDocRef = adminDB.collection('users').doc(userId).collection('progress').doc(courseId);
        const enrollmentDocRef = adminDB.collection('users').doc(userId).collection('enrollments').doc(courseId);

        const [courseSnap, progressSnap, enrollmentSnap] = await Promise.all([
            courseDocRef.get(),
            progressDocRef.get(),
            enrollmentDocRef.get()
        ]);

        if (!courseSnap.exists) {
            return { success: false, error: 'Curso não encontrado.' };
        }

        const course = { id: courseSnap.id, ...courseSnap.data() } as Course;
        const completedLessons = progressSnap.exists ? progressSnap.data()?.completedLessons || [] : [];
        const isEnrolled = enrollmentSnap.exists ? true : false;
        
        const hasAccess = (course.priceInCredits || 0) === 0 || isEnrolled;

        return {
            success: true,
            course: {
                 ...course,
                 createdAt: (course.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
            },
            completedLessons,
            hasAccess
        };

    } catch(e) {
        return { success: false, error: (e as Error).message };
    }
}

export async function purchaseCourse(courseId: string, userId: string) {
  if (!userId || !courseId) {
    return { success: false, error: "Dados inválidos." };
  }

  const userRef = adminDB.collection('users').doc(userId);
  const courseRef = adminDB.collection('courses').doc(courseId);
  const enrollmentRef = userRef.collection('enrollments').doc(courseId);
  const transactionRef = userRef.collection('transactions').doc();

  try {
    const { success, error } = await adminDB.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const courseDoc = await transaction.get(courseRef);

      if (!userDoc.exists) {
        return { success: false, error: "Usuário não encontrado." };
      }
      if (!courseDoc.exists) {
        return { success: false, error: "Curso não encontrado." };
      }

      const userProfile = userDoc.data() as UserProfile;
      const courseData = courseDoc.data() as Course;
      const price = courseData.priceInCredits || 0;
      const userCredits = userProfile.credits || 0;

      if (price > 0 && userCredits < price) {
        return { success: false, error: "Créditos insuficientes." };
      }

      if (price > 0) {
        transaction.update(userRef, { credits: userCredits - price });
      }

      transaction.set(enrollmentRef, {
        courseId: courseId,
        enrolledAt: Timestamp.now(),
        status: 'active',
        source: 'purchase',
      });
      
      transaction.update(courseRef, {
          students: (courseData.students || 0) + 1,
          revenue: (courseData.revenue || 0) + price
      });
      
      transaction.set(transactionRef, {
          type: 'usage',
          creditsUsed: price,
          usageReason: `Compra do curso: ${courseData.title}`,
          createdAt: Timestamp.now(),
      });

      return { success: true };
    });

    if (!success) {
      return { success: false, error };
    }

    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/dashboard');
    revalidatePath('/billing');
    return { success: true };

  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
