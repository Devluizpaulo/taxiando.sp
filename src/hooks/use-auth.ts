
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, type UserProfile } from '@/components/providers/auth-provider';

export type { UserProfile } from '@/components/providers/auth-provider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProtectionOptions {
  redirectTo?: string;
  requiredRoles?: UserProfile['role'][];
}

export function useAuthProtection({
  redirectTo = '/login',
  requiredRoles,
}: AuthProtectionOptions = {}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to be determined
    }

    if (!user) {
      router.push(redirectTo);
      return;
    }
    
    if (requiredRoles && requiredRoles.length > 0) {
      if (!userProfile || !requiredRoles.includes(userProfile.role)) {
        router.push('/dashboard'); // Redirect to a safe default page if role doesn't match
      }
    }

  }, [user, userProfile, loading, router, redirectTo, requiredRoles]);

  return { user, userProfile, loading };
}
