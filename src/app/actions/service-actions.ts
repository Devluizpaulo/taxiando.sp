

'use server';

import { revalidatePath } from 'next/cache';
import { adminDB, Timestamp } from '@/lib/firebase-admin';
import type { ServiceListing, UserProfile } from '@/lib/types';
import { nanoid } from 'nanoid';
import { serviceFormSchema, type ServiceFormValues } from '@/lib/service-schemas';
import { auth } from '@/lib/firebase';
import { uploadBlogImages } from './secure-storage-actions';
import admin from 'firebase-admin';
import { cleanUserProfile, timestampToISO, cleanFirestoreData } from '@/lib/utils';

export async function createService(data: ServiceFormValues, providerId: string, providerName: string) {
    if (!providerId) return { success: false, error: "ID do prestador não fornecido." };
    
    try {
        const validation = serviceFormSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: 'Dados inválidos.' };
        }
        
        const { imageFiles, ...restOfData } = validation.data;
        let finalImageUrls = restOfData.imageUrls?.map(img => img.url) || [];

        if (imageFiles && imageFiles.length > 0) {
            const files = Array.from(imageFiles) as File[];
            const uploadResults = await uploadBlogImages(files, providerId, providerName, false);
            
            // Como uploadBlogImages retorna um objeto simples, não um array, apenas verifica success
            if (!uploadResults.success) {
                throw new Error('Nenhuma imagem foi enviada com sucesso.');
            }
            // Se houver lógica futura para múltiplas URLs, adicionar aqui
        }

        if (finalImageUrls.length === 0) {
            return { success: false, error: 'Pelo menos uma imagem é obrigatória.' };
        }

        const serviceId = nanoid();
        const serviceData = {
            ...restOfData,
            imageUrls: finalImageUrls,
            providerId,
            provider: providerName,
            status: 'Pendente',
            createdAt: Timestamp.now(),
        };
        
        await adminDB.collection('services').doc(serviceId).set(serviceData);
        
        revalidatePath('/services');
        revalidatePath('/admin');
        
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getServiceById(serviceId: string): Promise<ServiceListing | null> {
    if (!serviceId) return null;
    try {
        const docRef = await adminDB.collection('services').doc(serviceId).get();
        if (!docRef.exists) return null;

        const data = docRef.data()!;
        const cleanedData = cleanFirestoreData(data);
        return {
            ...cleanedData,
            id: docRef.id,
        } as ServiceListing;
    } catch (error) {
        console.error("Error fetching service by ID:", error);
        return null;
    }
}

export async function updateService(serviceId: string, data: ServiceFormValues) {
    if (!serviceId) return { success: false, error: 'ID do serviço não fornecido.' };

    try {
        const validation = serviceFormSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: 'Dados inválidos.' };
        }
        
        const { currentUser } = auth;
        if (!currentUser) return { success: false, error: "Usuário não autenticado." };
        
        const { imageFiles, ...restOfData } = validation.data;
        let finalImageUrls = restOfData.imageUrls?.map(img => img.url) || [];

        if (imageFiles && imageFiles.length > 0) {
            for (const file of Array.from(imageFiles)) {
                const formData = new FormData();
                formData.append('file', file as File);
                const uploadResults = await uploadBlogImages([file as File], currentUser.uid, 'blog', false);
                if (uploadResults.success) {
                    // Se houver lógica futura para múltiplas URLs, adicionar aqui
                } else {
                    throw new Error(`Falha no upload da imagem ${(file as File).name}`);
                }
            }
        }
        
        if (finalImageUrls.length === 0) {
            return { success: false, error: 'Pelo menos uma imagem é obrigatória.' };
        }

        const serviceRef = adminDB.collection('services').doc(serviceId);
        await serviceRef.update({
            ...restOfData,
            imageUrls: finalImageUrls,
            status: 'Pendente',
            updatedAt: Timestamp.now(),
        });
        
        revalidatePath('/services');
        revalidatePath('/admin');
        revalidatePath(`/services/${serviceId}`);
        revalidatePath(`/services/${serviceId}/edit`);

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
            const cleanedData = cleanFirestoreData(data);
            return {
                ...cleanedData,
                id: doc.id,
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
        const { currentUser } = auth;
        if (!currentUser) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        const serviceRef = adminDB.collection('services').doc(serviceId);
        const doc = await serviceRef.get();
        if (!doc.exists) return { success: false, error: "Serviço não encontrado."};
        
        const userDoc = await adminDB.collection('users').doc(currentUser.uid).get();
        const userProfile = userDoc.data();
        const serviceData = doc.data() as ServiceListing;

        // Allow update if user is admin OR if user is the provider
        if (userProfile?.role !== 'admin' && serviceData.providerId !== currentUser.uid) {
            return { success: false, error: 'Você não tem permissão para alterar este serviço.' };
        }
        
        const currentStatus = serviceData.status;
        if (currentStatus === 'Pendente' || currentStatus === 'Rejeitado') {
             return { success: false, error: `Não é possível alterar o status de um serviço ${currentStatus}.` };
        }

        await serviceRef.update({ status: newStatus });
        revalidatePath('/services');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteService(serviceId: string) {
    if (!serviceId) return { success: false, error: "ID do serviço não fornecido." };
    
    try {
        const { currentUser } = auth;
        if (!currentUser) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        const serviceRef = adminDB.collection('services').doc(serviceId);
        const serviceDoc = await serviceRef.get();
        if (!serviceDoc.exists) {
            return { success: false, error: 'Serviço não encontrado.' };
        }

        const userDoc = await adminDB.collection('users').doc(currentUser.uid).get();
        const userProfile = userDoc.data();
        const serviceData = serviceDoc.data() as ServiceListing;

        if (userProfile?.role !== 'admin' && serviceData.providerId !== currentUser.uid) {
            return { success: false, error: 'Você não tem permissão para remover este serviço.' };
        }

        await serviceRef.delete();
        revalidatePath('/services');
        revalidatePath('/admin'); // Also revalidate admin in case admin deleted it
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
        
        if (!serviceDoc.exists || (serviceDoc.data()?.status !== 'Ativo' && serviceDoc.data()?.status !== 'Pendente')) {
            return { success: false, error: 'Serviço não encontrado ou indisponível.' };
        }
        
        const serviceData = serviceDoc.data() as ServiceListing;
        
        const providerDoc = await adminDB.collection('users').doc(serviceData.providerId).get();
        const provider = providerDoc.exists ? providerDoc.data() as UserProfile : null;
        
        return { 
            success: true, 
            service: { ...serviceData, id: serviceDoc.id }, 
            provider 
        };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getProviderPublicProfile(providerId: string) {
    if (!providerId) {
        return { success: false, error: "ID do prestador não fornecido." };
    }
    try {
        const [providerDoc, servicesQuery] = await Promise.all([
            adminDB.collection('users').doc(providerId).get(),
            adminDB.collection('services')
                .where('providerId', '==', providerId)
                .where('status', '==', 'Ativo')
                .orderBy('createdAt', 'desc')
                .get()
        ]);
        
        if (!providerDoc.exists || providerDoc.data()?.role !== 'provider') {
            return { success: false, error: "Prestador não encontrado." };
        }
            
        const providerData = providerDoc.data() as UserProfile;
        const { uid: _, ...providerDataWithoutUid } = providerData;
        const providerProfile = cleanUserProfile({ ...providerDataWithoutUid, uid: providerDoc.id }) as UserProfile;
        const activeServices = servicesQuery.docs.map(doc => {
             const data = doc.data();
             const cleanedData = cleanFirestoreData(data);
             return {
                ...cleanedData,
                id: doc.id,
            } as ServiceListing;
        });

        return { success: true, provider: providerProfile, services: activeServices };

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function trackProviderProfileView(providerId: string) {
    if (!providerId) return { success: false, error: 'ID do prestador não fornecido.' };

    try {
        const providerRef = adminDB.collection('users').doc(providerId);
        await providerRef.update({
            profileViewCount: admin.firestore.FieldValue.increment(1)
        });
        return { success: true };
    } catch (error) {
        // Fail silently so it doesn't break the page load
        console.error(`Error tracking profile view for provider ${providerId}:`, (error as Error).message);
        return { success: false, error: (error as Error).message };
    }
}
