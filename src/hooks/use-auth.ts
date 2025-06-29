'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/providers/auth-provider';

// Re-export UserProfile for convenience so other files don't need to change.
export type { UserProfile } from '@/components/providers/auth-provider';


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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
