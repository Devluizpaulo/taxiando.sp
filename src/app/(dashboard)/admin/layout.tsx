
"use client"
import { useAuthProtection } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/loading-screen';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuthProtection({ requiredRoles: ['admin'] });
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return <>{children}</>;
}
