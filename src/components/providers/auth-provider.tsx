

'use client';

import { useState, useEffect, SetStateAction, createContext, ReactNode } from 'react';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { type UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cleanUserProfile } from '@/lib/utils';


export interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    setUserProfile: (value: SetStateAction<UserProfile | null>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type { UserProfile };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      let unsubscribeProfile: (() => void) | undefined;

      if (user) {
        user.getIdTokenResult(true).then(idTokenResult => {
            const authTime = new Date(idTokenResult.authTime).getTime();
            
            const userDocRef = doc(db, 'users', user.uid);
            
            unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const rawProfile = docSnap.data() as UserProfile;
                const cleanedProfile = cleanUserProfile(rawProfile) as UserProfile;
                const sessionValidSince =
                  typeof cleanedProfile.sessionValidSince === 'string'
                    ? new Date(cleanedProfile.sessionValidSince).getTime()
                    : undefined;

                // Check if the current token is older than the last valid session timestamp.
                // Add a small grace period (e.g., 5 seconds) to prevent race conditions where
                // the token is issued just before the new session timestamp is written.
                if (sessionValidSince && authTime < (sessionValidSince - 5000)) {
                    console.warn("Stale session detected. Signing out.", { authTime, sessionValidSince });
                    toast({
                      variant: "destructive",
                      title: "Sessão Expirada",
                      description: "Você fez login em outro dispositivo. Esta sessão foi encerrada por segurança.",
                      duration: 8000
                    });
                    signOut(auth);
                } else {
                    setUser(user);
                    setUserProfile(cleanedProfile);
                }
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
        }).catch(error => {
            console.error("Error getting ID token:", error);
            // This is where the user-token-expired error can manifest.
            // We can handle it silently by forcing a token refresh.
            if (error.code === 'auth/user-token-expired') {
                console.log("Token expired, forcing refresh...");
                user.getIdToken(true); // Silently refresh the token in the background
            } else {
                signOut(auth);
            }
            if(loading) setLoading(false);
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
