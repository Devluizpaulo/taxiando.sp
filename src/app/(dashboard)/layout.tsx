

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
import { Building, FileText, LayoutDashboard, LogOut, Shield, FilePen, CheckSquare, Wrench, BookOpen, KeyRound, CreditCard, ShoppingCart, Calendar, Settings, Megaphone, Tag, Handshake, Mail, Newspaper, Star, LifeBuoy, Headset, ImageIcon, Library, Car, Users, MapPin, BarChart2, Search, Map, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationBell } from "@/components/notification-bell";
import { getPublicSettings } from "../actions/admin-actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { updateSeekingRentalsStatus } from "../actions/user-actions";


function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { isMobile, setOpenMobile } = useSidebar();
  const [siteSettings, setSiteSettings] = useState<{siteName: string, logoUrl: string} | null>(null);
  const [showSeekingModal, setShowSeekingModal] = useState(false);
  const [modalType, setModalType] = useState<'onboarding' | 'periodic'>('periodic');


  useEffect(() => {
    getPublicSettings().then(setSiteSettings);
  }, []);

  useEffect(() => {
    if (loading || !userProfile || userProfile.role !== 'driver') return;
    
    const lastCheck = userProfile.lastSeekingRentalsCheck;

    if (!lastCheck) { // First-time login for this feature
        setModalType('onboarding');
        setShowSeekingModal(true);
    } else { // Periodic check for users already seeking
        const sevenDaysAgo = subDays(new Date(), 7);
        if (userProfile.isSeekingRentals && new Date(lastCheck as string) < sevenDaysAgo) {
            setModalType('periodic');
            setShowSeekingModal(true);
        }
    }
}, [userProfile, loading]);

  const handleUpdateSeekingStatus = async (isSeeking: boolean) => {
    if (!user) return;
    const result = await updateSeekingRentalsStatus(user.uid, isSeeking);
    if (result.success) {
      toast({ title: "Status Atualizado!", description: "Sua preferência de busca por vagas foi salva." });
    } else {
      toast({ variant: 'destructive', title: "Erro", description: "Não foi possível atualizar seu status." });
    }
    setShowSeekingModal(false);
  };


  React.useEffect(() => {
    if (loading) return; // Wait for auth to be ready

    if (!user) {
      router.push('/login');
      return;
    }

    // Role-based redirection logic
    if (userProfile) {
      const currentPath = window.location.pathname;

      // Only perform redirection if the user lands on the generic /dashboard page
      if (currentPath === '/dashboard') {
        switch (userProfile.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'fleet':
            router.push('/fleet');
            break;
          case 'provider':
            router.push('/services');
            break;
          // 'driver' role correctly stays on '/dashboard'
          default:
            break;
        }
      }
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
              {siteSettings ? (
                  <Image
                    src={siteSettings.logoUrl && siteSettings.logoUrl !== '' ? siteSettings.logoUrl : "/logo.png"}
                    alt={siteSettings.siteName}
                    width={150}
                    height={42}
                    className="h-12 w-auto rounded-lg shadow-md"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo.png"; }}
                  />
              ) : (
                  <Skeleton className="h-12 w-36" />
              )}
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
                          <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/library"><Library/> Biblioteca</Link></SidebarMenuButton></SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                     <SidebarGroup>
                        <SidebarGroupLabel>Explorar</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/events"><Map/> Guia SP & Eventos</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/blog"><Newspaper/> Blog & Notícias</Link></SidebarMenuButton></SidebarMenuItem>
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
                           <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/fleet/find-drivers"><Search/> Buscar Motoristas</Link></SidebarMenuButton></SidebarMenuItem>
                           <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/billing"><CreditCard/> Faturamento</Link></SidebarMenuButton></SidebarMenuItem>
                           <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/fleet/reports"><BarChart2/> Relatórios</Link></SidebarMenuButton></SidebarMenuItem>
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
                        <SidebarGroupLabel>Gestão e Vendas</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/services/marketplace"><Eye/> Ver Anúncios Públicos</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/services/reviews"><Star/> Minhas Avaliações</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/services/reports"><BarChart2/> Relatórios</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel>Suporte</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/faq"><LifeBuoy/> Central de Ajuda (FAQ)</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/contact"><Mail/> Fale Conosco</Link></SidebarMenuButton></SidebarMenuItem>
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
                        <SidebarGroupLabel>Gestão de Usuários</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/users?tab=drivers"><Car/> Motoristas</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/users?tab=fleets"><Building/> Frotas</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/users?tab=providers"><Wrench/> Prestadores</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel>Gestão de Conteúdo</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/courses"><BookOpen className="text-blue-500" /> Cursos</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/blog"><Newspaper className="text-purple-500" /> Blog/Notícias</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/events"><Calendar className="text-orange-500" /> Eventos</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/city-guide"><MapPin className="text-teal-500" /> Guia da Cidade</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/library"><Library className="text-indigo-500" /> Biblioteca</Link></SidebarMenuButton></SidebarMenuItem>
                                <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/gallery"><ImageIcon className="text-green-500" /> Galeria</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                     <SidebarGroup>
                        <SidebarGroupLabel>Marketing & Finanças</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/billing"><ShoppingCart className="text-green-500" /> Pacotes de Crédito</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/courses/analytics"><BarChart2 className="text-purple-500" /> Análise de Cursos</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/coupons"><Tag className="text-teal-500" /> Cupons</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/newsletter"><Mail className="text-orange-500" /> Newsletter</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/notifications"><Megaphone className="text-pink-500" /> Notificações</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/partners"><Handshake className="text-cyan-500" /> Parceiros</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/marketing/quiz"><Star className="text-yellow-500" /> Quizzes</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/reports"><BarChart2 className="text-green-500" /> Relatórios</Link></SidebarMenuButton></SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                     <SidebarGroup>
                        <SidebarGroupLabel>Moderação</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/reviews"><Star className="text-amber-500" /> Avaliações</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/support"><LifeBuoy className="text-red-500" /> Suporte</Link></SidebarMenuButton></SidebarMenuItem>
                                 <SidebarMenuItem onClick={handleMenuClick}><SidebarMenuButton asChild><Link href="/admin/settings"><Settings className="text-indigo-500" /> Configurações</Link></SidebarMenuButton></SidebarMenuItem>
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
      
      <AlertDialog open={showSeekingModal} onOpenChange={setShowSeekingModal}>
          <AlertDialogContent>
              {modalType === 'onboarding' ? (
                  <>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Quer encontrar o carro ideal? 🚗</AlertDialogTitle>
                          <AlertDialogDescription>
                              Ative seu "Perfil de Candidato" para que as melhores frotas te encontrem. Seu perfil completo, cursos e reputação ficam visíveis para elas, aumentando suas chances. Você pode desativar isso a qualquer momento no seu perfil.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => handleUpdateSeekingStatus(false)}>Agora Não</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUpdateSeekingStatus(true)}>Ativar meu Perfil</AlertDialogAction>
                      </AlertDialogFooter>
                  </>
              ) : (
                  <>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Olá, {userProfile?.name?.split(' ')[0]}! Tudo certo por aí?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Só para confirmar, você ainda está buscando ativamente por oportunidades de aluguel de veículo?
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => handleUpdateSeekingStatus(false)}>Não, por enquanto</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUpdateSeekingStatus(true)}>Sim, continuo buscando</AlertDialogAction>
                      </AlertDialogFooter>
                  </>
              )}
          </AlertDialogContent>
      </AlertDialog>
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
