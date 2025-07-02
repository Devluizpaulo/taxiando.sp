
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { type Vehicle, type VehicleApplication, type VehiclePerk, type UserProfile } from '@/lib/types';
import { vehiclePerks } from '@/lib/data';
import { Timestamp } from 'firebase-admin/firestore';
import { type VehicleFormValues } from '@/lib/fleet-schemas';

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
            return { 
                ...data,
                id: doc.id, 
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
            } as Vehicle;
        });

        let applications: VehicleApplication[] = [];
        if (vehicleIds.length > 0) {
            const applicationsQuery = adminDB.collection('applications').where('vehicleId', 'in', vehicleIds).orderBy('appliedAt', 'desc');
            const applicationsSnapshot = await applicationsQuery.get();
            applications = applicationsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    appliedAt: (data.appliedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                } as VehicleApplication;
            });
        }
        
        return { success: true, vehicles, applications };

    } catch (error) {
        return { success: false, error: (error as Error).message, vehicles: [], applications: [] };
    }
}


// Create or Update a vehicle
export async function upsertVehicle(data: VehicleFormValues, fleetId: string, vehicleId?: string) {
    if (!fleetId) return { success: false, error: 'ID da frota não fornecido.' };

    try {
        const perksToSave = (data.perks || [])
            .map(perkId => vehiclePerks.find(p => p.id === perkId)!)
            .filter(Boolean) as VehiclePerk[];

        const vehicleData = {
            plate: data.plate.toUpperCase(),
            make: data.make,
            model: data.model,
            year: data.year,
            status: data.status,
            dailyRate: data.dailyRate,
            imageUrl: data.imageUrl,
            condition: data.condition,
            description: data.description,
            fleetId,
            paymentInfo: {
                terms: data.paymentTerms,
                methods: data.paymentMethods || [],
            },
            perks: perksToSave,
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
        await adminDB.collection('vehicles').doc(vehicleId).delete();
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
        await adminDB.collection('applications').doc(applicationId).update({ status: newStatus });
        revalidatePath('/fleet');
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// --- Functions for Rentals Marketplace ---

export async function getAvailableVehicles(): Promise<Vehicle[]> {
    try {
        const snapshot = await adminDB.collection('vehicles')
            .where('status', '==', 'Disponível')
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

        const fleet = { uid: fleetDoc.id, ...fleetDoc.data() } as UserProfile;
        
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
            driverProfileStatus: user.profileStatus,
            vehicleId: vehicleId,
            vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
            fleetId: vehicle.fleetId,
            company: 'Nome da Frota', // This should be fetched from the fleet's profile
            appliedAt: Timestamp.now(),
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
        console.error("Error fetching featured vehicles: ", (error as Error).message);
        return [];
    }
}

export async function getFleetPublicProfile(fleetId: string) {
    if (!fleetId) {
        return { success: false, error: "ID da frota não fornecido." };
    }
    try {
        const fleetDoc = await adminDB.collection('users').doc(fleetId).get();
        if (!fleetDoc.exists || fleetDoc.data()?.role !== 'fleet') {
            return { success: false, error: "Frota não encontrada." };
        }
        
        const vehiclesQuery = await adminDB.collection('vehicles')
            .where('fleetId', '==', fleetId)
            .where('status', '==', 'Disponível')
            .orderBy('createdAt', 'desc')
            .get();
            
        const fleetProfile = { uid: fleetDoc.id, ...fleetDoc.data() } as UserProfile;
        const availableVehicles = vehiclesQuery.docs.map(doc => {
             const data = doc.data();
             return {
                ...data,
                id: doc.id,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Vehicle;
        });

        return { success: true, fleet: fleetProfile, vehicles: availableVehicles };

    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
