'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import type { ServiceListing, UserProfile } from '@/lib/types';
import { nanoid } from 'nanoid';

export type ServiceFormValues = Omit<ServiceListing, 'id' | 'providerId' | 'provider' | 'createdAt' | 'status'>;

export async function createService(data: ServiceFormValues, providerId: string, providerName: string) {
    if (!providerId) return { success: false, error: "ID do prestador não fornecido." };
    
    try {
        const serviceId = nanoid();
        const serviceData: Omit<ServiceListing, 'id' | 'createdAt'> = {
            ...data,
            providerId,
            provider: providerName,
            status: 'Pendente',
        };
        
        await adminDB.collection('services').doc(serviceId).set({
            ...serviceData,
            id: serviceId,
            createdAt: Timestamp.now(),
        });
        
        revalidatePath('/services');
        revalidatePath('/admin');
        
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getServicesByProvider(providerId: string): Promise<ServiceListing[]> {
    if (!providerId) return [];
    try {
        const snapshot = await adminDB.collection('services').where('providerId', '==', providerId).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            } as ServiceListing;
        });
    } catch (error) {
        console.error("Error fetching services by provider: ", (error as Error).message);
        return [];
    }
}

export async function updateServiceStatus(serviceId: string, newStatus: 'Ativo' | 'Pausado') {
    if (!serviceId) return { success: false, error: "ID do serviço não fornecido." };
    try {
        await adminDB.collection('services').doc(serviceId).update({ status: newStatus });
        revalidatePath('/services');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteService(serviceId: string) {
    if (!serviceId) return { success: false, error: "ID do serviço não fornecido." };
    try {
        await adminDB.collection('services').doc(serviceId).delete();
        revalidatePath('/services');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getActiveServices(): Promise<ServiceListing[]> {
    try {
        const snapshot = await adminDB.collection('services')
            .where('status', '==', 'Ativo')
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as ServiceListing;
        });
    } catch (error) {
        console.error("Error fetching active services: ", (error as Error).message);
        return [];
    }
}

export async function getFeaturedServices(limit: number = 3): Promise<ServiceListing[]> {
     try {
        const snapshot = await adminDB.collection('services')
            .where('status', '==', 'Ativo')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as ServiceListing;
        });
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return []; // Gracefully fail during initial setup
        }
        console.error("Error fetching featured services: ", (error as Error).message);
        return [];
    }
}

export async function getServiceAndProviderDetails(serviceId: string) {
    if (!serviceId) {
        return { success: false, error: 'ID do serviço não fornecido.' };
    }
    try {
        const serviceDoc = await adminDB.collection('services').doc(serviceId).get();
        
        if (!serviceDoc.exists || serviceDoc.data()?.status !== 'Ativo') {
            return { success: false, error: 'Serviço não encontrado ou indisponível.' };
        }
        
        const serviceData = serviceDoc.data() as ServiceListing;
        
        const providerDoc = await adminDB.collection('users').doc(serviceData.providerId).get();
        const provider = providerDoc.exists() ? providerDoc.data() as UserProfile : null;
        
        return { 
            success: true, 
            service: { ...serviceData, id: serviceDoc.id }, 
            provider 
        };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
