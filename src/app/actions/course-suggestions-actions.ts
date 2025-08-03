'use server';

import { adminDB } from '@/lib/firebase-admin';
import { type CourseSuggestion } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// Buscar todas as sugestões de cursos
export async function getCourseSuggestions(): Promise<{ success: boolean; suggestions?: CourseSuggestion[]; error?: string }> {
  try {
    const suggestionsSnapshot = await adminDB
      .collection('courseSuggestions')
      .orderBy('createdAt', 'desc')
      .get();

    const suggestions = suggestionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CourseSuggestion[];

    return { success: true, suggestions };
  } catch (error) {
    console.error('Error fetching course suggestions:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Buscar sugestões por status
export async function getCourseSuggestionsByStatus(status: CourseSuggestion['status']): Promise<{ success: boolean; suggestions?: CourseSuggestion[]; error?: string }> {
  try {
    const suggestionsSnapshot = await adminDB
      .collection('courseSuggestions')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .get();

    const suggestions = suggestionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CourseSuggestion[];

    return { success: true, suggestions };
  } catch (error) {
    console.error('Error fetching course suggestions by status:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Criar nova sugestão (usado pelos motoristas)
export async function createCourseSuggestion(
  driverId: string,
  driverName: string,
  driverEmail: string,
  suggestion: string
): Promise<{ success: boolean; suggestionId?: string; error?: string }> {
  try {
    const suggestionData = {
      driverId,
      driverName,
      driverEmail,
      suggestion,
      status: 'pending' as const,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const docRef = await adminDB
      .collection('courseSuggestions')
      .add(suggestionData);

    revalidatePath('/admin/courses');
    return { success: true, suggestionId: docRef.id };
  } catch (error) {
    console.error('Error creating course suggestion:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Atualizar status da sugestão (usado pelos admins)
export async function updateCourseSuggestionStatus(
  suggestionId: string,
  status: CourseSuggestion['status'],
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      status,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await adminDB
      .collection('courseSuggestions')
      .doc(suggestionId)
      .update(updateData);

    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error) {
    console.error('Error updating course suggestion status:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Deletar sugestão
export async function deleteCourseSuggestion(suggestionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDB
      .collection('courseSuggestions')
      .doc(suggestionId)
      .delete();

    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error) {
    console.error('Error deleting course suggestion:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Buscar estatísticas das sugestões
export async function getCourseSuggestionsStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
  try {
    const suggestionsSnapshot = await adminDB
      .collection('courseSuggestions')
      .get();

    const suggestions = suggestionsSnapshot.docs.map(doc => doc.data()) as CourseSuggestion[];

    const stats = {
      total: suggestions.length,
      pending: suggestions.filter(s => s.status === 'pending').length,
      approved: suggestions.filter(s => s.status === 'approved').length,
      rejected: suggestions.filter(s => s.status === 'rejected').length,
      implemented: suggestions.filter(s => s.status === 'implemented').length
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error fetching course suggestions stats:', error);
    return { success: false, error: (error as Error).message };
  }
} 