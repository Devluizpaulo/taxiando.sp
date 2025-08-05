

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

// Função utilitária para limpar dados antes de enviar para Firestore
function cleanDataForFirestore(data: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
            cleaned[key] = null;
        } else if (value === '') {
            // Para campos de string opcionais, manter como string vazia em vez de null
            cleaned[key] = '';
        } else if (typeof value === 'object' && value !== null) {
            cleaned[key] = cleanDataForFirestore(value);
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

export async function createCourse(values: any, userId?: string, userName?: string) {
    // Log detalhado dos dados recebidos
    console.log('[createCourse] Dados recebidos:', JSON.stringify(values, null, 2));
    
    // Validação simplificada e otimizada
    const validation = courseFormSchema.safeParse({
        ...values,
        modules: values.modules ?? [],
        // Garantir que campos numéricos sejam números
        estimatedDuration: values.estimatedDuration ? Number(values.estimatedDuration) : 60,
        investmentCost: values.investmentCost ? Number(values.investmentCost) : 0,
        priceInCredits: values.priceInCredits ? Number(values.priceInCredits) : 0,
        saleValue: values.saleValue ? Number(values.saleValue) : 0,
        minimumPassingScore: values.minimumPassingScore ? Number(values.minimumPassingScore) : 70,
        // Garantir que campos booleanos sejam booleanos
        isPublicListing: Boolean(values.isPublicListing),
        enableComments: Boolean(values.enableComments),
        autoCertification: Boolean(values.autoCertification),
        // Garantir que campos de enum sejam válidos
        difficulty: values.difficulty || 'Iniciante',
        contractType: values.contractType || 'own_content',
        courseType: values.courseType || 'own_course',
        // Garantir que campos de string obrigatórios sejam strings
        title: String(values.title || ''),
        description: String(values.description || ''),
        category: String(values.category || ''),
        // Garantir que campos opcionais sejam tratados corretamente
        targetAudience: values.targetAudience || '',
        partnerName: values.partnerName || '',
        contractPdfUrl: values.contractPdfUrl || '',
        authorInfo: values.authorInfo || '',
        legalNotice: values.legalNotice || '',
        // Garantir que campos de array sejam arrays
        seoTags: Array.isArray(values.seoTags) ? values.seoTags : [],
        // Garantir que campos de enum opcionais sejam válidos
        paymentType: values.paymentType || undefined,
        contractStatus: values.contractStatus || undefined,
        // Garantir que campos de string opcionais sejam strings
        coverImageUrl: values.coverImageUrl || '',
    });
    
    if (!validation.success) {
        console.log('[createCourse] Erros de validação:', validation.error.errors);
        return { success: false, error: 'Dados inválidos: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
    }
    
    // Checagem de duplicidade de título
    const existing = await adminDB.collection('courses').where('title', '==', values.title).get();
    if (!existing.empty) {
        return { success: false, error: 'Já existe um curso com este título.' };
    }
    
    try {
        const courseId = nanoid();
        const courseData: Omit<Course, 'id' | 'createdAt' | 'modules' | 'totalLessons' | 'totalDuration' > = cleanDataForFirestore({
            title: values.title,
            description: values.description,
            category: values.category,
            status: 'Draft',
            students: 0,
            difficulty: values.difficulty || 'Iniciante',
            investmentCost: values.investmentCost || 0,
            priceInCredits: values.priceInCredits || 0,
            revenue: 0,
            authorInfo: userName || '',
            legalNotice: 'Este conteúdo é protegido por direitos autorais. A reprodução não autorizada é proibida.',
            
            // Campos essenciais
            targetAudience: values.targetAudience || null,
            estimatedDuration: values.estimatedDuration || 60,
            isPublicListing: values.isPublicListing || false,
            
            // Tipo de contrato
            contractType: values.contractType,
            saleValue: values.saleValue || 0,
            
            // Controle financeiro
            courseType: values.courseType,
            partnerName: values.partnerName || null,
            paymentType: values.paymentType || null,
            contractStatus: values.contractStatus || null,
            contractPdfUrl: values.contractPdfUrl || null,
            
            // SEO e tags
            seoTags: values.seoTags || [],
            
            // Configurações de avaliação
            enableComments: values.enableComments !== false, // default true
            autoCertification: values.autoCertification !== false, // default true
            minimumPassingScore: values.minimumPassingScore || 70,
            
            // Métricas de desempenho
            completionRate: 0,
            averageRating: 0,
            reviewCount: 0,
            viewCount: 0,
            
            // Campos de criação
            createdBy: userId || null,
            createdByName: userName || null,
        });
        
        await adminDB.collection('courses').doc(courseId).set(cleanDataForFirestore({
            ...courseData,
            id: courseId,
            modules: values.modules || [],
            totalLessons: values.totalLessons || 0,
            totalDuration: values.totalDuration || 0,
            createdAt: Timestamp.now(),
        }));
        
        revalidatePath('/admin/courses');
        return { success: true, courseId: courseId };
    } catch (error) {
        console.error('[createCourse] Erro:', error);
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
        const allModuleLessonsComplete = (targetModule.lessons || []).every(lesson =>
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

        // Função para normalizar arrays recursivamente
        const normalizeArrays = (obj: any): any => {
            if (obj === null || obj === undefined) {
                return [];
            }
            
            if (Array.isArray(obj)) {
                return obj.map(item => normalizeArrays(item));
            }
            
            if (typeof obj === 'object') {
                const normalized: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (key === 'modules' || key === 'lessons' || key === 'pages' || 
                        key === 'contentBlocks' || key === 'materials' || key === 'questions') {
                        normalized[key] = normalizeArrays(value);
                    } else {
                        normalized[key] = value;
                    }
                }
                return normalized;
            }
            
            return obj;
        };

        const coursesData = coursesSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAtTimestamp = data.createdAt as Timestamp;
            const isoDate = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate().toISOString() : new Date().toISOString();

            // Normalizar arrays antes de retornar
            const normalizedData = normalizeArrays(data);

            return {
                ...normalizedData,
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
        console.log(`[getCourseById] Buscando curso com ID: ${courseId}`);
        
        if (!courseId || courseId.trim() === '') {
            console.error('[getCourseById] ID do curso é inválido:', courseId);
            return null;
        }

        const courseDoc = await adminDB.collection('courses').doc(courseId).get();
        
        if (!courseDoc.exists) {
            console.log(`[getCourseById] Curso não encontrado: ${courseId}`);
            return null;
        }
        
        const data = courseDoc.data() as any;
        console.log(`[getCourseById] Dados brutos do curso:`, data);
        
        // Função para normalizar arrays recursivamente
        const normalizeArrays = (obj: any): any => {
            console.log(`[normalizeArrays] Normalizando:`, typeof obj, obj);
            
            if (obj === null || obj === undefined) {
                console.log(`[normalizeArrays] Retornando array vazio para null/undefined`);
                return [];
            }
            
            if (Array.isArray(obj)) {
                console.log(`[normalizeArrays] É um array, processando ${obj.length} itens`);
                return obj.map(item => normalizeArrays(item));
            }
            
            if (typeof obj === 'object') {
                console.log(`[normalizeArrays] É um objeto, processando chaves:`, Object.keys(obj));
                const normalized: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (key === 'modules' || key === 'lessons' || key === 'pages' || 
                        key === 'contentBlocks' || key === 'materials' || key === 'questions') {
                        console.log(`[normalizeArrays] Normalizando array para chave: ${key}`);
                        normalized[key] = normalizeArrays(value);
                    } else {
                        normalized[key] = value;
                    }
                }
                return normalized;
            }
            
            console.log(`[normalizeArrays] Retornando valor primitivo:`, obj);
            return obj;
        };
        
        // Normalizar todos os arrays do curso
        console.log(`[getCourseById] Iniciando normalização dos dados...`);
        const normalizedData = normalizeArrays(data);
        console.log(`[getCourseById] Dados normalizados:`, normalizedData);
        console.log(`[getCourseById] Tipo de modules após normalização:`, typeof normalizedData.modules);
        console.log(`[getCourseById] Modules é array?`, Array.isArray(normalizedData.modules));
        
        // Convert Timestamps to ISO strings for client-side serialization
        const serializedData = {
            ...normalizedData,
            id: courseDoc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        };

        console.log(`[getCourseById] Dados serializados:`, serializedData);
        return serializedData as Course;
    } catch (error) {
        console.error("[getCourseById] Erro ao buscar curso:", error);
        console.error("[getCourseById] Stack trace:", (error as Error).stack);
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

        // Upload da capa se for File (campo não existe no CourseFormValues, então removemos)
        let coverImageUrl = '';

        // Simplificar - usar módulos diretamente sem uploads complexos
        const finalModules = values.modules || [];

        finalModules.forEach(module => {
            (module.lessons || []).forEach(lesson => {
                totalLessons++;
                totalDuration += Number(lesson.totalDuration) || 0;
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
