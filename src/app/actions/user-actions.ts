'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc, query, limit } from 'firebase/firestore';

interface CreateProfileData {
    userId: string;
    email: string | null;
    name: string;
    phone: string;
}

export async function createUserProfile(data: CreateProfileData) {
    if (!data.userId) {
        throw new Error('ID do usuário inválido.');
    }

    const userRef = doc(db, 'users', data.userId);
    const userDoc = await getDoc(userRef);

    // If the user document already exists, they somehow landed on the welcome page again.
    // Just redirect them to the dashboard.
    if (userDoc.exists()) {
        redirect('/dashboard');
        return;
    }

    // To ensure robustness, we will no longer automatically assign the admin role here.
    // The first user will be created as a standard driver and must be promoted to 'admin' manually in the Firebase console.
    // This avoids potential race conditions or errors in an empty database environment.
    const profileData = {
        uid: data.userId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: 'driver', // Default to driver. Admin promotion is a manual, secure step.
        profileStatus: 'incomplete', // All new users from this flow start as incomplete.
        createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profileData);

    revalidatePath('/'); // Revalidate all paths to ensure data consistency
    redirect('/dashboard');
}
