
'use server';

import { revalidatePath } from 'next/cache';
import { adminDB } from '@/lib/firebase-admin';
import { type Vehicle, type VehicleApplication, type VehiclePerk, type UserProfile, AdminUser, MatchResult, MatchDetails } from '@/lib/types';
import { vehiclePerks } from '@/lib/data';
import { Timestamp } from 'firebase-admin/firestore';
import { type VehicleFormValues } from '@/lib/fleet-schemas';
import { auth } from '@/lib/firebase';

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
            type: data.type,
            status: data.status,
            dailyRate: data.dailyRate,
            imageUrls: data.imageUrls,
            condition: data.condition,
            transmission: data.transmission,
            fuelType: data.fuelType,
            description: data.description,
            fleetId,
            paymentInfo: {
                terms: data.paymentTerms,
                methods: data.paymentMethods || [],
            },
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
export async function getDriverProfile(driverId: string): Promise<AdminUser | null> {
    if (!driverId) return null;
    try {
        const userDoc = await adminDB.collection('users').doc(driverId).get();
        if (!userDoc.exists) return null;

        const data = userDoc.data() as UserProfile;
        
        const toISO = (ts?: Timestamp): string | undefined => ts ? ts.toDate().toISOString() : undefined;

        return {
            ...data,
            uid: userDoc.id,
            createdAt: toISO(data.createdAt) || new Date().toISOString(),
            cnhExpiration: toISO(data.cnhExpiration),
            condutaxExpiration: toISO(data.condutaxExpiration),
            alvaraExpiration: toISO(data.alvaraExpiration),
            lastNotificationCheck: toISO(data.lastNotificationCheck),
        } as AdminUser;

    } catch (error) {
        console.error("Error fetching driver profile:", error);
        return null;
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
        const fleetProfile = { ...fleetDataWithoutUid, uid: fleetDoc.id } as UserProfile;
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


export async function getDriversSeekingRentals(): Promise<AdminUser[]> {
    try {
        const snapshot = await adminDB.collection('users')
            .where('role', '==', 'driver')
            .where('profileStatus', '==', 'approved')
            .orderBy('createdAt', 'desc')
            .get();
            
        const toISO = (ts?: Timestamp): string | undefined => ts ? ts.toDate().toISOString() : undefined;

        const drivers = snapshot.docs.map(doc => {
            const data = doc.data() as UserProfile;
            const { uid: _, ...dataWithoutUid } = data;
             return {
                ...dataWithoutUid,
                uid: doc.id,
                createdAt: toISO(data.createdAt) || new Date().toISOString(),
                cnhExpiration: toISO(data.cnhExpiration),
                condutaxExpiration: toISO(data.condutaxExpiration),
                alvaraExpiration: toISO(data.alvaraExpiration),
                lastNotificationCheck: toISO(data.lastNotificationCheck),
            } as AdminUser;
        });
        
        // Filter in code for drivers who have set preferences
        return drivers.filter(d => d.rentalPreferences && Object.keys(d.rentalPreferences).length > 0);

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
            score += 25;
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
