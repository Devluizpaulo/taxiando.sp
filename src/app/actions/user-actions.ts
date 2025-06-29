'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, serverTimestamp, getDoc, query, limit } from 'firebase/firestore';

interface CreateProfileData {
    name: string;
    phone: string;
}

export async function createUserProfile(data: CreateProfileData) {
    const { currentUser } = auth;
    if (!currentUser) {
        throw new Error('Usuário não autenticado.');
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        // Profile already exists, just redirect
        redirect('/dashboard');
    }

    // Check if this is the first user, to assign admin role
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, limit(1));
    const existingUsersSnapshot = await getDocs(q);
    const isFirstUser = existingUsersSnapshot.empty;
    const role = isFirstUser ? 'admin' : 'driver'; // Default to driver if not the first

    const profileData = {
        uid: currentUser.uid,
        email: currentUser.email,
        name: data.name,
        phone: data.phone,
        role: role,
        profileStatus: 'approved', // First user (admin) is approved by default
        createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profileData);

    revalidatePath('/'); // Revalidate all paths
    redirect('/dashboard');
}
