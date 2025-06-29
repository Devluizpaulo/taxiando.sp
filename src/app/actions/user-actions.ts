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

    // Check if this is the first user in the collection.
    // If so, they become the administrator.
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, limit(1));
    const snapshot = await getDocs(q);
    const isFirstUser = snapshot.empty;

    const profileData = {
        uid: data.userId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: isFirstUser ? 'admin' : 'driver', // Assign 'admin' role if first user, otherwise 'driver'.
        profileStatus: isFirstUser ? 'approved' : 'incomplete', // Admins are approved by default.
        createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profileData);

    revalidatePath('/'); // Revalidate all paths to ensure data consistency
    redirect('/dashboard');
}
