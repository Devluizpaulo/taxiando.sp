'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { nanoid } from 'nanoid';
import { uploadFile } from './storage-actions';
import { type ContentBlock } from '@/lib/types';

// Tipos para elementos educativos
export interface EducationalElement {
  id: string;
  courseId: string;
  lessonId: string;
  type: ContentBlock['blockType'];
  data: ContentBlock;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
  metadata?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedTime?: number; // em minutos
    tags?: string[];
    category?: string;
  };
}

// Upload de imagens para elementos educativos
export async function uploadEducationalImage(
  file: File, 
  elementType: string, 
  courseId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!file) {
      return { success: false, error: 'Nenhum arquivo fornecido' };
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.' };
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Arquivo muito grande. Máximo 5MB.' };
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `educational-elements/${courseId}/${elementType}/${nanoid()}.${fileExtension}`;

    // Upload do arquivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    const uploadResult = await uploadFile(formData, 'system'); // Usar 'system' como userId padrão
    
    if (uploadResult.success && uploadResult.url) {
      return { success: true, url: uploadResult.url };
    } else {
      return { success: false, error: uploadResult.error || 'Erro no upload' };
    }
  } catch (error) {
    console.error('Erro no upload de imagem educativa:', error);
    return { success: false, error: 'Erro interno no servidor' };
  }
}

// Criar elemento educativo
export async function createEducationalElement(
  courseId: string,
  lessonId: string,
  elementData: ContentBlock,
  userId: string,
  metadata?: EducationalElement['metadata']
): Promise<{ success: boolean; elementId?: string; error?: string }> {
  try {
    const elementId = nanoid();
    const now = Timestamp.now();

    const element: EducationalElement = {
      id: elementId,
      courseId,
      lessonId,
      type: elementData.blockType,
      data: elementData,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      status: 'draft',
      metadata: metadata || {}
    };

    // Salvar no Firestore
    await adminDB
      .collection('educationalElements')
      .doc(elementId)
      .set(element);

    // Atualizar a lição para incluir referência ao elemento
    await adminDB
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(lessonId)
      .update({
        educationalElements: FieldValue.arrayUnion(elementId),
        updatedAt: now
      });

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath(`/courses/${courseId}`);

    return { success: true, elementId };
  } catch (error) {
    console.error('Erro ao criar elemento educativo:', error);
    return { success: false, error: 'Erro ao criar elemento educativo' };
  }
}

// Atualizar elemento educativo
export async function updateEducationalElement(
  elementId: string,
  elementData: ContentBlock,
  metadata?: EducationalElement['metadata']
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = Timestamp.now();

    await adminDB
      .collection('educationalElements')
      .doc(elementId)
      .update({
        data: elementData,
        metadata: metadata || {},
        updatedAt: now
      });

    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar elemento educativo:', error);
    return { success: false, error: 'Erro ao atualizar elemento educativo' };
  }
}

// Buscar elementos educativos de uma lição
export async function getEducationalElements(
  courseId: string,
  lessonId: string
): Promise<{ success: boolean; elements?: EducationalElement[]; error?: string }> {
  try {
    const snapshot = await adminDB
      .collection('educationalElements')
      .where('courseId', '==', courseId)
      .where('lessonId', '==', lessonId)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'asc')
      .get();

    const elements: EducationalElement[] = [];
    snapshot.forEach(doc => {
      elements.push(doc.data() as EducationalElement);
    });

    return { success: true, elements };
  } catch (error) {
    console.error('Erro ao buscar elementos educativos:', error);
    return { success: false, error: 'Erro ao buscar elementos educativos' };
  }
}

// Buscar elemento educativo específico
export async function getEducationalElement(
  elementId: string
): Promise<{ success: boolean; element?: EducationalElement; error?: string }> {
  try {
    const doc = await adminDB
      .collection('educationalElements')
      .doc(elementId)
      .get();

    if (!doc.exists) {
      return { success: false, error: 'Elemento não encontrado' };
    }

    const element = doc.data() as EducationalElement;
    return { success: true, element };
  } catch (error) {
    console.error('Erro ao buscar elemento educativo:', error);
    return { success: false, error: 'Erro ao buscar elemento educativo' };
  }
}

// Deletar elemento educativo
export async function deleteEducationalElement(
  elementId: string,
  courseId: string,
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Deletar do Firestore
    await adminDB
      .collection('educationalElements')
      .doc(elementId)
      .delete();

    // Remover referência da lição
    await adminDB
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(lessonId)
      .update({
        educationalElements: FieldValue.arrayRemove(elementId),
        updatedAt: Timestamp.now()
      });

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath(`/courses/${courseId}`);

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar elemento educativo:', error);
    return { success: false, error: 'Erro ao deletar elemento educativo' };
  }
}

// Publicar/despublicar elemento educativo
export async function updateEducationalElementStatus(
  elementId: string,
  status: 'draft' | 'published' | 'archived'
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDB
      .collection('educationalElements')
      .doc(elementId)
      .update({
        status,
        updatedAt: Timestamp.now()
      });

    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status do elemento:', error);
    return { success: false, error: 'Erro ao atualizar status' };
  }
}

// Buscar elementos por tipo
export async function getEducationalElementsByType(
  courseId: string,
  type: ContentBlock['blockType']
): Promise<{ success: boolean; elements?: EducationalElement[]; error?: string }> {
  try {
    const snapshot = await adminDB
      .collection('educationalElements')
      .where('courseId', '==', courseId)
      .where('type', '==', type)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'asc')
      .get();

    const elements: EducationalElement[] = [];
    snapshot.forEach(doc => {
      elements.push(doc.data() as EducationalElement);
    });

    return { success: true, elements };
  } catch (error) {
    console.error('Erro ao buscar elementos por tipo:', error);
    return { success: false, error: 'Erro ao buscar elementos por tipo' };
  }
}

// Buscar elementos por dificuldade
export async function getEducationalElementsByDifficulty(
  courseId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<{ success: boolean; elements?: EducationalElement[]; error?: string }> {
  try {
    const snapshot = await adminDB
      .collection('educationalElements')
      .where('courseId', '==', courseId)
      .where('metadata.difficulty', '==', difficulty)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'asc')
      .get();

    const elements: EducationalElement[] = [];
    snapshot.forEach(doc => {
      elements.push(doc.data() as EducationalElement);
    });

    return { success: true, elements };
  } catch (error) {
    console.error('Erro ao buscar elementos por dificuldade:', error);
    return { success: false, error: 'Erro ao buscar elementos por dificuldade' };
  }
}

// Buscar elementos por tags
export async function getEducationalElementsByTags(
  courseId: string,
  tags: string[]
): Promise<{ success: boolean; elements?: EducationalElement[]; error?: string }> {
  try {
    const snapshot = await adminDB
      .collection('educationalElements')
      .where('courseId', '==', courseId)
      .where('status', '==', 'published')
      .get();

    const elements: EducationalElement[] = [];
    snapshot.forEach(doc => {
      const element = doc.data() as EducationalElement;
      const elementTags = element.metadata?.tags || [];
      
      // Verificar se pelo menos uma tag corresponde
      const hasMatchingTag = tags.some(tag => elementTags.includes(tag));
      if (hasMatchingTag) {
        elements.push(element);
      }
    });

    return { success: true, elements };
  } catch (error) {
    console.error('Erro ao buscar elementos por tags:', error);
    return { success: false, error: 'Erro ao buscar elementos por tags' };
  }
}

// Duplicar elemento educativo
export async function duplicateEducationalElement(
  elementId: string,
  newCourseId: string,
  newLessonId: string,
  userId: string
): Promise<{ success: boolean; newElementId?: string; error?: string }> {
  try {
    // Buscar elemento original
    const originalDoc = await adminDB
      .collection('educationalElements')
      .doc(elementId)
      .get();

    if (!originalDoc.exists) {
      return { success: false, error: 'Elemento original não encontrado' };
    }

    const originalElement = originalDoc.data() as EducationalElement;
    const newElementId = nanoid();
    const now = Timestamp.now();

    // Criar cópia com novos IDs
    const newElement: EducationalElement = {
      ...originalElement,
      id: newElementId,
      courseId: newCourseId,
      lessonId: newLessonId,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      status: 'draft'
    };

    // Salvar nova cópia
    await adminDB
      .collection('educationalElements')
      .doc(newElementId)
      .set(newElement);

    // Atualizar nova lição
    await adminDB
      .collection('courses')
      .doc(newCourseId)
      .collection('modules')
      .doc(newLessonId)
      .update({
        educationalElements: FieldValue.arrayUnion(newElementId),
        updatedAt: now
      });

    revalidatePath(`/admin/courses/${newCourseId}/edit`);
    return { success: true, newElementId };
  } catch (error) {
    console.error('Erro ao duplicar elemento educativo:', error);
    return { success: false, error: 'Erro ao duplicar elemento educativo' };
  }
}

// Exportar elementos educativos
export async function exportEducationalElements(
  courseId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const snapshot = await adminDB
      .collection('educationalElements')
      .where('courseId', '==', courseId)
      .get();

    const elements: EducationalElement[] = [];
    snapshot.forEach(doc => {
      elements.push(doc.data() as EducationalElement);
    });

    const exportData = {
      courseId,
      exportDate: new Date().toISOString(),
      elements: elements.map(element => ({
        type: element.type,
        data: element.data,
        metadata: element.metadata
      }))
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error('Erro ao exportar elementos educativos:', error);
    return { success: false, error: 'Erro ao exportar elementos educativos' };
  }
}

// Importar elementos educativos
export async function importEducationalElements(
  courseId: string,
  lessonId: string,
  importData: any,
  userId: string
): Promise<{ success: boolean; importedCount?: number; error?: string }> {
  try {
    let importedCount = 0;

    for (const elementData of importData.elements) {
      const elementId = nanoid();
      const now = Timestamp.now();

      const element: EducationalElement = {
        id: elementId,
        courseId,
        lessonId,
        type: elementData.type,
        data: elementData.data,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        status: 'draft',
        metadata: elementData.metadata || {}
      };

      await adminDB
        .collection('educationalElements')
        .doc(elementId)
        .set(element);

      importedCount++;
    }

    // Atualizar lição
    await adminDB
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(lessonId)
      .update({
        updatedAt: Timestamp.now()
      });

    revalidatePath(`/admin/courses/${courseId}/edit`);
    return { success: true, importedCount };
  } catch (error) {
    console.error('Erro ao importar elementos educativos:', error);
    return { success: false, error: 'Erro ao importar elementos educativos' };
  }
} 