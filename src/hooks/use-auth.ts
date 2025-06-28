
'use client';

import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { type Badge, type FleetAmenity, type CreditPackage, type Transaction } from '@/lib/types';


export interface UserProfile {
    uid: string;
    email: string;
    role: 'driver' | 'fleet' | 'admin' | 'provider';
    createdAt: Timestamp;
    profileStatus?: 'incomplete' | 'pending_review' | 'approved' | 'rejected';
    
    // Driver: Personal & Contact
    name: string;
    phone?: string;
    hasWhatsApp?: boolean;
    bio?: string;
    photoUrl?: string;

    // Driver: Documents
    cnhNumber?: string;
    cnhCategory?: 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';
    cnhExpiration?: Timestamp;
    condutaxNumber?: string;
    condutaxExpiration?: Timestamp;
    alvaraExpiration?: Timestamp;
    vehicleLicensePlate?: string;
    cnhPoints?: number;

    // Driver: Qualifications
    specializedCourses?: string[];
    
    // Driver: Gamification
    earnedBadges?: Badge[];

    // Driver: Reference
    reference?: {
        name: string;
        relationship: string;
        phone: string;
    };

    // Driver: Consents
    financialConsent?: boolean;
    
    // Fleet/Provider: Business Info
    personType?: 'pf' | 'pj';
    cpf?: string;
    cnpj?: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    companyDescription?: string;
    address?: string;
    amenities?: FleetAmenity[];
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };

    // Billing
    credits?: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userProfile, loading, setUserProfile };
}


export function useAuthProtection(redirectTo = '/login') {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push(redirectTo);
        }
    }, [user, loading, router, redirectTo]);

    return { user, loading };
}
