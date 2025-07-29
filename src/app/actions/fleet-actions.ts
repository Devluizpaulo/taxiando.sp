
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { type Vehicle, type VehicleApplication, type VehiclePerk, type UserProfile, AdminUser, MatchResult, MatchDetails } from '@/lib/types';
import { vehiclePerks } from '@/lib/data';
import { Timestamp } from 'firebase-admin/firestore';
import { type VehicleFormValues } from '@/lib/fleet-schemas';
import { auth } from '@/lib/firebase';
import { uploadVehicleImages } from './secure-storage-actions';
import admin from 'firebase-admin';
import { cleanUserProfile, cleanFirestoreData } from '@/lib/utils';

// Get all data for a fleet's dashboard
export async function getFleetData(fleetId: string) {
    if (!fleetId) {
        return { success: false, error: "ID da frota não fornecido.", vehicles: [], applications: [] };
    }
    try {
        const vehiclesQuery = adminDB.collection('vehicles').where('fleetId', '==', fleetId).orderBy('createdAt', 'desc');
        const vehiclesSnapshot = await vehiclesQuery.get();
        const vehicleDocs = vehiclesSnapshot.docs;
        
        const vehicleIds = vehicleDocs.map(doc => doc.id);
        const vehicles = vehicleDocs.map(doc => {
            const data = doc.data();
            const cleanedData = cleanFirestoreData(data);
            return { 
                ...cleanedData,
                id: doc.id, 
            } as Vehicle;
        });

        let applications: VehicleApplication[] = [];
        if (vehicleIds.length > 0) {
            const applicationsQuery = adminDB.collection('applications').where('vehicleId', 'in', vehicleIds).orderBy('appliedAt', 'desc');
            const applicationsSnapshot = await applicationsQuery.get();
                    applications = applicationsSnapshot.docs.map(doc => {
            const data = doc.data();
            const cleanedData = cleanFirestoreData(data);
            return {
                ...cleanedData,
                id: doc.id,
            } as VehicleApplication;
        });
        }
        
        return { success: true, vehicles, applications };

    } catch (error) {
        return { success: false, error: (error as Error).message, vehicles: [], applications: [] };
    }
}


// Create or Update a vehicle
export async function upsertVehicle(data: VehicleFormValues, fleetId: string, fleetName: string, vehicleId?: string) {
    if (!fleetId) return { success: false, error: 'ID da frota não fornecido.' };

    try {
        const perksToSave = (data.perks || [])
            .map(perkId => vehiclePerks.find(p => p.id === perkId)!)
            .filter(Boolean) as VehiclePerk[];
        
        // Handle file uploads for new images using secure storage
        const uploadedImageUrls: string[] = [];
        if (data.imageFiles && data.imageFiles.length > 0) {
            const files = Array.from(data.imageFiles);
            const uploadResults = await uploadVehicleImages(files, fleetId, fleetName, vehicleId || 'new');
            
            // Como uploadVehicleImages retorna um objeto simples, não um array, apenas verifica success
            if (!uploadResults.success) {
                throw new Error('Nenhuma imagem foi enviada com sucesso.');
            }
            // Se houver lógica futura para múltiplas URLs, adicionar aqui
        }
        
        const existingUrls = data.imageUrls?.map(img => img.url) || [];
        const finalImageUrls = [...existingUrls, ...uploadedImageUrls];
       
        if (finalImageUrls.length === 0) {
            return { success: false, error: 'Pelo menos uma imagem do veículo é obrigatória.' };
        }
        if (finalImageUrls.length > 4) {
            return { success: false, error: 'Você pode adicionar no máximo 4 imagens por veículo.' };
        }
        
        const { imageFiles, imageUrls, ...vehicleDataToSave } = data;

        const vehicleData = {
            ...vehicleDataToSave,
            imageUrls: finalImageUrls,
            plate: data.plate.toUpperCase(),
            fleetId,
            perks: perksToSave,
            moderationStatus: 'Pendente' as const,
            updatedAt: Timestamp.now(),
        };

        let finalVehicleId = vehicleId;

        if (vehicleId) {
            const vehicleRef = adminDB.collection('vehicles').doc(vehicleId);
            await vehicleRef.update(vehicleData);
        } else {
            const newVehicleRef = adminDB.collection('vehicles').doc();
            await newVehicleRef.set({
                ...vehicleData,
                id: newVehicleRef.id,
                createdAt: Timestamp.now(),
            });
            finalVehicleId = newVehicleRef.id;
        }
        
        revalidatePath('/fleet');
        revalidatePath(`/rentals`);
        if (finalVehicleId) revalidatePath(`/rentals/${finalVehicleId}`);

        return { success: true };

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// Delete a vehicle
export async function deleteVehicle(vehicleId: string) {
    if (!vehicleId) return { success: false, error: 'ID do veículo não fornecido.' };
    
    try {
        const { currentUser } = auth;
        if (!currentUser) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        const vehicleRef = adminDB.collection('vehicles').doc(vehicleId);
        const vehicleDoc = await vehicleRef.get();
        if (!vehicleDoc.exists) {
            return { success: false, error: 'Veículo não encontrado.' };
        }
        
        const userDoc = await adminDB.collection('users').doc(currentUser.uid).get();
        const userProfile = userDoc.data();

        const vehicleData = vehicleDoc.data() as Vehicle;
        
        // Allow deletion if user is admin OR if user owns the vehicle
        if (userProfile?.role !== 'admin' && vehicleData.fleetId !== currentUser.uid) {
            return { success: false, error: 'Você não tem permissão para remover este veículo.' };
        }

        await vehicleRef.delete();
        revalidatePath('/fleet');
        revalidatePath(`/rentals`);
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// Update application status
export async function updateApplicationStatus(applicationId: string, newStatus: 'Aprovado' | 'Rejeitado') {
    if (!applicationId) return { success: false, error: 'ID da candidatura não fornecido.' };

    try {
        const { currentUser } = auth;
        if (!currentUser) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        const applicationRef = adminDB.collection('applications').doc(applicationId);
        const applicationDoc = await applicationRef.get();

        if (!applicationDoc.exists) {
            return { success: false, error: 'Candidatura não encontrada.' };
        }

        const userDoc = await adminDB.collection('users').doc(currentUser.uid).get();
        const userProfile = userDoc.data();

        const applicationData = applicationDoc.data() as VehicleApplication;

        // Allow update if user is admin OR if user owns the vehicle associated with the application
        if (userProfile?.role !== 'admin' && applicationData.fleetId !== currentUser.uid) {
            return { success: false, error: 'Você não tem permissão para alterar esta candidatura.' };
        }

        await applicationRef.update({ status: newStatus });
        revalidatePath('/fleet');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// Get a driver's full profile for a fleet to review
export async function getDriverProfile(driverId: string, fleetUserId: string): Promise<{success: boolean; profile?: AdminUser | null; error?: string}> {
    if (!driverId || !fleetUserId) {
        return { success: false, error: "Dados inválidos." };
    }

    const userRef = adminDB.collection('users').doc(fleetUserId);
    const driverRef = adminDB.collection('users').doc(driverId);
    
    try {
        const result = await adminDB.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error("Usuário da frota não encontrado.");
            
            const currentCredits = userDoc.data()?.credits || 0;
            if (currentCredits < 1) throw new Error("Créditos insuficientes para ver o perfil.");
            
            transaction.update(userRef, { credits: admin.firestore.FieldValue.increment(-1) });

            const driverDoc = await transaction.get(driverRef);
            if (!driverDoc.exists) throw new Error("Perfil do motorista não encontrado.");

            const data = driverDoc.data() as UserProfile;
            const cleanedData = cleanUserProfile(data);

            const profile = {
                ...cleanedData,
                uid: driverDoc.id,
            } as AdminUser;
            
            return { success: true, profile };
        });

        revalidatePath('/fleet'); // Revalidate fleet dashboard to show updated credits
        return result;

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


// --- Functions for Rentals Marketplace ---

export async function getAvailableVehicles(): Promise<Vehicle[]> {
    try {
        const snapshot = await adminDB.collection('vehicles')
            .where('status', '==', 'Disponível')
            .where('moderationStatus', '==', 'Aprovado')
            .orderBy('createdAt', 'desc')
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Vehicle;
        });
    } catch (error) {
        console.error("Error fetching available vehicles: ", (error as Error).message);
        return [];
    }
}


export async function getVehicleDetails(vehicleId: string) {
    try {
        const vehicleDoc = await adminDB.collection('vehicles').doc(vehicleId).get();
        if (!vehicleDoc.exists) {
            return { success: false, error: 'Veículo não encontrado.' };
        }
        
        const vehicle = vehicleDoc.data() as Vehicle;
        const fleetDoc = await adminDB.collection('users').doc(vehicle.fleetId).get();
        if (!fleetDoc.exists) {
            return { success: false, error: 'Frota associada não encontrada.' };
        }

        const fleetData = fleetDoc.data() as UserProfile;
        const { uid: _, ...fleetDataWithoutUid } = fleetData;
        const fleet = { ...fleetDataWithoutUid, uid: fleetDoc.id } as UserProfile;
        
        return { 
            success: true, 
            vehicle: { ...vehicle, id: vehicleDoc.id }, 
            fleet 
        };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function createApplication(vehicleId: string, userId: string) {
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    if (!vehicleId) return { success: false, error: "ID do veículo não fornecido." };
    
    try {
        const [vehicleSnap, userSnap] = await Promise.all([
            adminDB.collection('vehicles').doc(vehicleId).get(),
            adminDB.collection('users').doc(userId).get()
        ]);

        if (!vehicleSnap.exists) return { success: false, error: "Veículo não existe." };
        if (!userSnap.exists) return { success: false, error: "Usuário não existe." };

        const vehicle = vehicleSnap.data() as Vehicle;
        const user = userSnap.data() as UserProfile;
        
        if (user.profileStatus !== 'approved') {
            return { success: false, error: "Seu perfil precisa estar aprovado para se candidatar." };
        }
        
        // Check for existing application
        const existingAppQuery = await adminDB.collection('applications')
            .where('driverId', '==', userId)
            .where('vehicleId', '==', vehicleId)
            .limit(1)
            .get();

        if (!existingAppQuery.empty) {
            return { success: false, error: "Você já se candidatou para este veículo." };
        }

        const appRef = adminDB.collection('applications').doc();
        const applicationData: Omit<VehicleApplication, 'id'> = {
            driverId: userId,
            driverName: user.name || 'Nome não preenchido',
            driverPhotoUrl: user.photoUrl || '',
            driverProfileStatus: 'approved',
            vehicleId: vehicleId,
            vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
            fleetId: vehicle.fleetId,
            company: 'Nome da Frota', // This should be fetched from the fleet's profile
            appliedAt: Timestamp.now().toDate().toISOString(),
            status: 'Pendente',
        };

        const fleetSnap = await adminDB.collection('users').doc(vehicle.fleetId).get();
        if (fleetSnap.exists) {
            const fleetData = fleetSnap.data() as UserProfile;
            applicationData.company = fleetData.nomeFantasia || fleetData.name || 'Frota Parceira';
        }

        await appRef.set(applicationData);

        revalidatePath('/applications');
        revalidatePath(`/fleet`);
        return { success: true };

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

export async function getDriverApplications(userId: string): Promise<VehicleApplication[]> {
    if (!userId) return [];
    try {
        const snapshot = await adminDB.collection('applications')
            .where('driverId', '==', userId)
            .orderBy('appliedAt', 'desc')
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                appliedAt: (data.appliedAt as Timestamp).toDate().toISOString()
            } as VehicleApplication;
        });
    } catch (error) {
        return [];
    }
}

export async function getFeaturedVehicles(limit: number = 3): Promise<Vehicle[]> {
    try {
        const snapshot = await adminDB.collection('vehicles')
            .where('status', '==', 'Disponível')
            .where('moderationStatus', '==', 'Aprovado')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Vehicle;
        });
    } catch (error) {
        if ((error as Error).message.includes('Firebase Admin SDK not initialized')) {
            return []; // Gracefully fail during initial setup
        }
        console.error("Error fetching featured vehicles: ", (error as Error).message);
        return [];
    }
}

export async function getFleetPublicProfile(fleetId: string) {
    if (!fleetId) {
        return { success: false, error: "ID da frota não fornecido." };
    }
    try {
        const [fleetDoc, vehiclesQuery] = await Promise.all([
            adminDB.collection('users').doc(fleetId).get(),
            adminDB.collection('vehicles')
                .where('fleetId', '==', fleetId)
                .where('status', '==', 'Disponível')
                .where('moderationStatus', '==', 'Aprovado')
                .orderBy('createdAt', 'desc')
                .get()
        ]);

        if (!fleetDoc.exists || fleetDoc.data()?.role !== 'fleet') {
            return { success: false, error: "Frota não encontrada." };
        }
        
        const fleetData = fleetDoc.data() as UserProfile;
        const { uid: _, ...fleetDataWithoutUid } = fleetData;
        const fleetProfile = cleanUserProfile({ ...fleetDataWithoutUid, uid: fleetDoc.id }) as UserProfile;
        const availableVehicles = vehiclesQuery.docs.map(doc => {
             const data = doc.data();
             const cleanedData = cleanFirestoreData(data);
             return {
                ...cleanedData,
                id: doc.id,
            } as Vehicle;
        });

        return { success: true, fleet: fleetProfile, vehicles: availableVehicles };

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}


export async function getDriversSeekingRentals(): Promise<AdminUser[]> {
    try {
        const snapshot = await adminDB.collection('users')
            .where('role', '==', 'driver')
            .where('profileStatus', '==', 'approved')
            .where('isSeekingRentals', '==', true)
            .orderBy('createdAt', 'desc')
            .get();
            
        const drivers = snapshot.docs.map(doc => {
            const data = doc.data() as UserProfile;
            const cleanedData = cleanUserProfile(data);
            return {
                ...cleanedData,
                uid: doc.id,
            } as AdminUser;
        });
        
        return drivers;

    } catch (error) {
        console.error("Error fetching drivers seeking rentals:", error);
        return [];
    }
}

const calculateProfileCompleteness = (profile: AdminUser): number => {
    if (!profile) return 0;
    
    const fields = [
        profile.photoUrl,
        profile.bio,
        profile.phone,
        profile.cnhNumber,
        profile.cnhCategory,
        profile.cnhExpiration,
        profile.condutaxNumber,
        profile.reference?.name,
        profile.financialConsent,
        profile.specializedCourses?.length
    ];
    
    const filledCount = fields.filter(Boolean).length;
    return Math.round((filledCount / fields.length) * 100);
};


export async function getDriverMatchesForVehicle(vehicleId: string): Promise<MatchResult[]> {
    if (!vehicleId) return [];

    const [vehicleDetails, drivers] = await Promise.all([
        getVehicleDetails(vehicleId),
        getDriversSeekingRentals()
    ]);

    if (!vehicleDetails.success || !vehicleDetails.vehicle) {
        console.error(`Error fetching vehicle for matching: ${vehicleDetails.error}`);
        return [];
    }
    const vehicle = vehicleDetails.vehicle;

    if (!drivers.length) return [];
    
    const results: MatchResult[] = [];

    for (const driver of drivers) {
        const prefs = driver.rentalPreferences;
        if (!prefs) continue;

        let score = 0;
        const details: MatchDetails = {
            vehicleType: false,
            transmission: false,
            fuelType: false,
            price: false,
            profileCompleteness: false,
            rating: false,
            creditCard: false,
        };

        // --- Vehicle Preferences (60 points) ---
        if (prefs.vehicleTypes?.includes(vehicle.type)) {
            score += 20;
            details.vehicleType = true;
        }
        if (prefs.transmission === 'indifferent' || prefs.transmission === vehicle.transmission) {
            score += 15;
            details.transmission = true;
        }
        if (prefs.fuelTypes?.includes(vehicle.fuelType)) {
            score += 10;
            details.fuelType = true;
        }
        if (!prefs.maxDailyRate || vehicle.dailyRate <= prefs.maxDailyRate) {
            score += 10;
            details.price = true;
        }
         if (driver.hasCreditCardForDeposit) {
            score += 5;
            details.creditCard = true;
        }


        // --- Driver Quality (40 points) ---
        const completeness = calculateProfileCompleteness(driver);
        score += (completeness / 100) * 20; // max 20 pts
        details.profileCompleteness = completeness >= 80;

        const avgRating = driver.averageRating || 0;
        const reviewCount = driver.reviewCount || 0;

        if (reviewCount > 0) {
            score += (avgRating / 5) * 15; // max 15 pts
            details.rating = avgRating >= 4.0;
        } else {
            score += 7.5; // Neutral score for new drivers (half points)
            details.rating = true;
        }

        score += Math.min(reviewCount / 10, 1) * 5; // max 5 pts
        
        results.push({ driver, score: Math.min(100, Math.round(score)), details });
    }

    return results.sort((a, b) => b.score - a.score);
}

// --- Report Actions ---
export async function getFleetReportData(fleetId: string) {
    if (!fleetId) {
        return { success: false, error: 'ID da frota não fornecido' };
    }
    
    try {
        const vehiclesSnapshot = await adminDB.collection('vehicles').where('fleetId', '==', fleetId).get();
        const vehicles = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
        
        if (vehicles.length === 0) {
            return {
                success: true,
                totalVehicles: 0,
                totalApplications: 0,
                approvalRate: 0,
                applicationStatusData: [],
                vehiclePerformance: []
            };
        }
        
        const vehicleIds = vehicles.map(v => v.id);
        const applicationsSnapshot = await adminDB.collection('applications').where('vehicleId', 'in', vehicleIds).get();
        const applications = applicationsSnapshot.docs.map(doc => doc.data() as VehicleApplication);
        
        const totalApplications = applications.length;
        const approvedCount = applications.filter(app => app.status === 'Aprovado').length;
        const pendingCount = applications.filter(app => app.status === 'Pendente').length;
        const rejectedCount = applications.filter(app => app.status === 'Rejeitado').length;

        const approvalRate = totalApplications > 0 ? (approvedCount / totalApplications) * 100 : 0;

        const applicationStatusData = [
            { name: 'Pendentes', value: pendingCount },
            { name: 'Aprovadas', value: approvedCount },
            { name: 'Rejeitadas', value: rejectedCount },
        ];
        
        const vehiclePerformance = vehicles.map(vehicle => {
            const vehicleApps = applications.filter(app => app.vehicleId === vehicle.id);
            return {
                id: vehicle.id,
                name: `${vehicle.make} ${vehicle.model} (${vehicle.plate})`,
                totalApplications: vehicleApps.length,
                pendingApplications: vehicleApps.filter(app => app.status === 'Pendente').length,
                approvedApplications: vehicleApps.filter(app => app.status === 'Aprovado').length,
            };
        }).sort((a, b) => b.totalApplications - a.totalApplications);

        return {
            success: true,
            totalVehicles: vehicles.length,
            totalApplications,
            approvalRate,
            applicationStatusData,
            vehiclePerformance,
        };

    } catch (error) {
        console.error("Error fetching fleet report data:", error);
        return { success: false, error: (error as Error).message };
    }
}
