"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Building, FileText, LayoutDashboard, LogOut, Shield, FilePen, CheckSquare, Wrench, BookOpen, KeyRound, CreditCard, ShoppingCart, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import React from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <LoadingScreen className="fixed inset-0 z-50" />;
  }
  
  if (!user) {
      return <LoadingScreen className="fixed inset-0 z-50" />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link href="/dashboard">
              <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-12 w-auto rounded-lg shadow-md" />
            </Link>
        </SidebarHeader>
        <SidebarContent>
            {userProfile ? (
              <SidebarMenu>
                {userProfile?.role === 'driver' && (
                <>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/dashboard"><LayoutDashboard/> Meu Painel</Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/profile"><FilePen/> Completar Perfil</Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/courses"><BookOpen/> Cursos</Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/applications"><CheckSquare/> Minhas Candidaturas</Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
                )}
                {(userProfile?.role === 'fleet' || userProfile?.role === 'admin') && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                    <Link href="/fleet"><Building/> Minha Frota</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                )}
                {userProfile?.role === 'provider' && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                    <Link href="/services"><Wrench/> Meus Serviços</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/billing"><CreditCard/> Faturamento e Créditos</Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/summarize"><FileText/> Sumarizador</Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
                {userProfile?.role === 'admin' && (
                <>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin"><Shield/> Painel Admin</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin/courses"><BookOpen/> Gerenciar Cursos</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Link href="/admin/events"><Calendar/> Gerenciar Eventos</Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin/billing"><ShoppingCart/> Pacotes de Crédito</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
                )}
            </SidebarMenu>
            ) : (
                <div className="p-2 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            )}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex w-full items-center gap-3">
            {userProfile ? (
            <>
              <Avatar>
                <AvatarImage src={user.photoURL ?? `https://placehold.co/40x40.png`} alt="User Avatar" />
                <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="truncate text-sm font-semibold">{userProfile.name ?? 'Usuário'}</span>
                <span className="truncate text-xs text-muted-foreground">{userProfile.email}</span>
              </div>
            </>
            ) : (
              <>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                </div>
              </>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
                {/* Potentially a search bar here */}
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
        </header>
        <main className="flex flex-1 flex-col p-4 sm:p-6">
            {(() => {
              if (userProfile) {
                return children;
              }
              // Auth check is done, user is logged in, but no profile was found in DB
              if (!loading && user && !userProfile) {
                return (
                  <div className="flex h-full w-full items-center justify-center">
                    <Card className="max-w-md text-center">
                      <CardHeader>
                        <CardTitle>Perfil não encontrado</CardTitle>
                        <CardDescription>
                          Não foi possível carregar os dados do seu perfil.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Isso pode acontecer se a sua conta foi criada manualmente e o perfil
                          no banco de dados ainda não existe. Certifique-se de que um
                          documento de usuário com a role correta existe no Firestore.
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
                      </CardFooter>
                    </Card>
                  </div>
                );
              }
              // Otherwise, show the loading screen while auth is in progress
              return <LoadingScreen />;
            })()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
