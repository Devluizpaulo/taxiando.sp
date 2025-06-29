'use client';

import { useState, useEffect, SetStateAction, createContext, ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, type Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { type Badge, type FleetAmenity } from '@/lib/types';

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

export interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    setUserProfile: (value: SetStateAction<UserProfile | null>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const value = { user, userProfile, loading, setUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
