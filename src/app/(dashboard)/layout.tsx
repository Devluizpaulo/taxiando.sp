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
import { Building, FileText, LayoutDashboard, LogOut, PanelLeft, Shield, FilePen, Search, CheckSquare, Wrench, BookOpen, KeyRound, CreditCard, ShoppingCart, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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

  if (loading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="hidden h-screen flex-col gap-4 border-r bg-card p-4 md:flex" style={{width: "16rem"}}>
          <Skeleton className="h-10" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
          <Skeleton className="h-12" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="mb-4 h-12 w-1/3" />
          <Skeleton className="mb-8 h-6 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navegação principal da plataforma Táxiando SP.
          </SheetDescription>
        </SheetHeader>
        <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link href="/dashboard">
              <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-12 w-auto rounded-lg shadow-md" />
            </Link>
        </SidebarHeader>
        <SidebarContent>
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
        </SidebarContent>
        <SidebarFooter>
          <div className="flex w-full items-center gap-3">
            <Avatar>
              <AvatarImage src={user.photoURL ?? `https://placehold.co/40x40.png`} alt="User Avatar" />
              <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="truncate text-sm font-semibold">{userProfile.name ?? 'Usuário'}</span>
              <span className="truncate text-xs text-muted-foreground">{userProfile.email}</span>
            </div>
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
        <main className="flex-1 p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
