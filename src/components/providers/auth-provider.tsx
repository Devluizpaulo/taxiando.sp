
'use client';

import { useState, useEffect, SetStateAction, createContext, ReactNode } from 'react';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { type UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // This can happen if the firestore doc creation fails after auth user is created
          console.error("User exists in Auth, but not in Firestore. Signing out.");
          toast({
            variant: "destructive",
            title: "Falha no Cadastro",
            description: "Não encontramos seu perfil. Por favor, tente se cadastrar novamente."
          });
          await signOut(auth);
          // The onAuthStateChanged listener will handle clearing the state on sign out.
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const value = { user, userProfile, loading, setUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
