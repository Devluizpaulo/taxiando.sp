
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { Building, FileText, LayoutDashboard, LogOut, Shield, FilePen, CheckSquare, Wrench, BookOpen, KeyRound, CreditCard, ShoppingCart, Calendar, Settings, Megaphone, Tag, Handshake, Mail, Newspaper, Star, LifeBuoy, Headset } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import React from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/notification-bell";


function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    // Redirect admin to admin panel from generic dashboard
    if (!loading && userProfile?.role === 'admin' && window.location.pathname === '/dashboard') {
        router.push('/admin');
    }
  }, [user, userProfile, loading, router]);
  
  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  if (loading || !user) {
    return <LoadingScreen className="fixed inset-0 z-50" />;
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
            <Link href="/dashboard" onClick={handleMenuClick}>
              <Image src="/logo.png" alt="Táxiando SP Logo" width={150} height={142} className="h-12 w-auto rounded-lg shadow-md" />
            </Link>
        </SidebarHeader>
        <SidebarContent>
            {userProfile ? (
              <SidebarMenu>
                {/* === MENU DO MOTORISTA === */}
                {userProfile.role === 'driver' && (
                  <>
                    <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/dashboard"><LayoutDashboard/> Meu Painel</Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarGroup>
                      <SidebarGroupLabel>Minha Carreira</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/rentals"><KeyRound/> Alugar Veículo</Link></SidebarMenuButton></SidebarMenuItem>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/applications"><CheckSquare/> Minhas Candidaturas</Link></SidebarMenuButton></SidebarMenuItem>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/courses"><BookOpen/> Cursos</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                      <SidebarGroupLabel>Meu Perfil</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/profile"><FilePen/> Completar Perfil</Link></SidebarMenuButton></SidebarMenuItem>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/billing"><CreditCard/> Faturamento</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                     <SidebarGroup>
                      <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                           <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/summarize"><FileText/> Sumarizador</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </>
                )}

                {/* === MENU DA FROTA === */}
                {userProfile.role === 'fleet' && (
                  <>
                    <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/fleet"><LayoutDashboard/> Meu Painel</Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarGroup>
                      <SidebarGroupLabel>Minha Empresa</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                           <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/fleet/profile"><Building/> Perfil da Frota</Link></SidebarMenuButton></SidebarMenuItem>
                           <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/billing"><CreditCard/> Faturamento</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                      <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/summarize"><FileText/> Sumarizador</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </>
                )}

                {/* === MENU DO PRESTADOR === */}
                {userProfile.role === 'provider' && (
                   <>
                    <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/services"><LayoutDashboard/> Meu Painel</Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarGroup>
                      <SidebarGroupLabel>Minha Empresa</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/services/profile"><Wrench/> Perfil do Prestador</Link></SidebarMenuButton></SidebarMenuItem>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/billing"><CreditCard/> Faturamento</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                      <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/summarize"><FileText/> Sumarizador</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </>
                )}
                
                {/* === MENU DO ADMIN === */}
                {userProfile.role === 'admin' && (
                  <>
                    <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin"><Shield className="text-red-500" /> Painel Admin</Link></SidebarMenuButton></SidebarMenuItem>
                    <SidebarGroup>
                        <SidebarGroupLabel>Gestão de Conteúdo</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/courses"><BookOpen className="text-blue-500" /> Cursos</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/blog"><Newspaper className="text-purple-500" /> Blog/Notícias</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/events"><Calendar className="text-orange-500" /> Eventos</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel>Gestão Financeira</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/billing"><ShoppingCart className="text-green-500" /> Pacotes de Crédito</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/coupons"><Tag className="text-teal-500" /> Cupons</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                     <SidebarGroup>
                        <SidebarGroupLabel>Marketing & Comunicação</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/newsletter"><Mail className="text-orange-500" /> Newsletter</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/notifications"><Megaphone className="text-pink-500" /> Notificações</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/partners"><Handshake className="text-cyan-500" /> Parceiros / Banners</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/quiz"><Star className="text-yellow-500" /> Quizzes</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                     <SidebarGroup>
                        <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/support"><LifeBuoy className="text-red-500" /> Suporte</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/settings/payments"><CreditCard className="text-indigo-500" /> Pagamentos</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                     <SidebarGroup>
                        <SidebarGroupLabel>Painéis de Usuário</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/dashboard"><LayoutDashboard/> Painel de Motorista</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/fleet"><Building/> Painel de Frota</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/services"><Wrench/> Painel de Prestador</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
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
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" title="Suporte">
                <Link href={userProfile?.role === 'admin' ? '/admin/support' : '/contact'}>
                  <Headset />
                </Link>
              </Button>
              <NotificationBell />
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
        </header>
        <main className="flex flex-1 flex-col p-4 sm:p-6">
            {userProfile ? children : <LoadingScreen />}
        </main>
      </SidebarInset>
    </>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </SidebarProvider>
  );
}
