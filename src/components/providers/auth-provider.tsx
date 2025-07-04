
'use client';

import { useState, useEffect, SetStateAction, createContext, ReactNode } from 'react';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      let unsubscribeProfile: (() => void) | undefined;

      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        
        unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          } else {
            console.error("User exists in Auth, but not in Firestore. Signing out.");
            toast({
              variant: "destructive",
              title: "Falha no Cadastro",
              description: "Não encontramos seu perfil. Por favor, tente se cadastrar novamente."
            });
            signOut(auth);
          }
           if (loading) setLoading(false);
        }, (error) => {
            console.error("Error listening to user profile:", error);
            setUser(null);
            setUserProfile(null);
            if (loading) setLoading(false);
        });

      } else {
        setUser(null);
        setUserProfile(null);
        if (loading) setLoading(false);
      }
      
      return () => {
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }
      };
    });

    return () => unsubscribeAuth();
  }, [toast, loading]);

  const value = { user, userProfile, loading, setUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
