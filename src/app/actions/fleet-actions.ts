
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { type Vehicle, type VehicleApplication, type VehiclePerk } from '@/lib/types';
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
        // TODO: Implement application fetching once application creation is complete.
        // For now, returning an empty array.
        // const applicationsQuery = adminDB.collection('applications').where('fleetId', '==', fleetId).orderBy('createdAt', 'desc');

        const [vehiclesSnapshot] = await Promise.all([
            vehiclesQuery.get(),
            // applicationsQuery.get()
        ]);

        const vehicles = vehiclesSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return { 
                ...data,
                id: doc.id, 
                createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : new Date().toISOString()
            } as Vehicle;
        });
        
        // Mock applications for now
        const applications: VehicleApplication[] = [];

        return { success: true, vehicles, applications };

    } catch (error) {
        console.error("Error fetching fleet data:", error);
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
            plate: data.plate,
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
        }
        
        revalidatePath('/fleet');
        revalidatePath(`/rentals`);
        if (vehicleId) revalidatePath(`/rentals/${vehicleId}`);

        return { success: true };

    } catch (error) {
        console.error("Error upserting vehicle:", error);
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
        console.error("Error deleting vehicle:", error);
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
        console.error("Error updating application status:", error);
        return { success: false, error: (error as Error).message };
    }
}
