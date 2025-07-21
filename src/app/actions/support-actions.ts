'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import { type SupportTicket } from '@/lib/types';
import * as z from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("O email é inválido."),
  message: z.string().min(10, "A mensagem precisa ter pelo menos 10 caracteres."),
});

export async function createSupportTicket(data: z.infer<typeof contactFormSchema>) {
    const validation = contactFormSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Dados inválidos.' };
    }
    
    try {
        const ticketRef = adminDB.collection('support_tickets').doc();
        await ticketRef.set({
            ...validation.data,
            id: ticketRef.id,
            status: 'Open',
            createdAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Não foi possível enviar sua mensagem. Tente novamente.' };
    }
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
    try {
        const snapshot = await adminDB.collection('support_tickets').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
                resolvedAt: data.resolvedAt ? (data.resolvedAt as Timestamp).toDate().toISOString() : undefined,
            } as SupportTicket;
        });
    } catch (error) {
        console.error("Error fetching support tickets: ", error);
        return [];
    }
}

export async function updateTicketStatus(ticketId: string, status: 'Open' | 'Resolved') {
    if (!ticketId) {
        return { success: false, error: 'ID do ticket não fornecido.' };
    }

    try {
        const updateData: { status: string; resolvedAt?: Timestamp } = { status };
        if (status === 'Resolved') {
            updateData.resolvedAt = Timestamp.now();
        }

        await adminDB.collection('support_tickets').doc(ticketId).update(updateData);
        revalidatePath('/admin/support');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
