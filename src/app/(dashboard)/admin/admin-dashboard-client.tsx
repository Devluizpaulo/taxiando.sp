
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthProtection } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Users, Briefcase, BookOpen, DollarSign, PackagePlus, ArrowRight, Calendar, CreditCard, ShoppingCart, Loader2, Eye, LogIn } from "lucide-react";

import { updateUserProfileStatus, updateListingStatus, getAdminDashboardData } from '@/app/actions/admin-actions';
import type { UserProfile, Opportunity, ServiceListing, AnalyticsData, AdminUser } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';


const getStatusVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Aprovado':
        case 'approved':
        case 'Ativo':
             return 'default';
        case 'Pendente': 
        case 'pending_review':
            return 'secondary';
        case 'Rejeitado':
        case 'rejected':
            return 'destructive';
        default: return 'outline';
    }
};

export function AdminDashboardClient() {
    const { loading: authLoading } = useAuthProtection({ requiredRoles: ['admin'] });
    const { toast } = useToast();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData>({});
    const [pageLoading, setPageLoading] = useState(true);
    
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [updatingUserStatus, setUpdatingUserStatus] = useState<string | null>(null);
    const [updatingListingStatus, setUpdatingListingStatus] = useState<string | null>(null);

     useEffect(() => {
        if (!authLoading) {
            const fetchData = async () => {
                setPageLoading(true);
                try {
                    const data = await getAdminDashboardData();
                    setUsers(data.users);
                    setOpportunities(data.opportunities);
                    setServices(data.services);
                    setAnalytics(data.analytics);
                } catch (error) {
                    toast({ variant: 'destructive', title: 'Erro ao Carregar Painel', description: 'Não foi possível carregar os dados do painel. Tente recarregar a página.' });
                } finally {
                    setPageLoading(false);
                }
            };
            fetchData();
        }
    }, [authLoading, toast]);


    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedUsers(users.filter(u => u.role === 'driver').map(u => u.uid));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers(prev => [...prev, userId]);
        } else {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        }
    };
    
    const handleUserStatusUpdate = async (userId: string, newStatus: 'Aprovado' | 'Rejeitado' | 'Pendente') => {
        setUpdatingUserStatus(userId);
        try {
            const result = await updateUserProfileStatus(userId, newStatus);
            if (result.success) {
                toast({ title: 'Sucesso', description: 'Status do usuário atualizado.' });
                setUsers(prev => prev.map(u => u.uid === userId ? { ...u, profileStatus: newStatus.toLowerCase() as UserProfile['profileStatus'] } : u));
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: result.error });
            }
        } finally {
            setUpdatingUserStatus(null);
        }
    }

    const handleListingApproval = async (id: string, type: 'opportunities' | 'services', newStatus: 'Aprovado' | 'Rejeitado') => {
        setUpdatingListingStatus(id);
        try {
            const result = await updateListingStatus(id, type, newStatus);
            if (result.success) {
                toast({ title: 'Sucesso', description: `Status do anúncio atualizado para ${newStatus}.`});
                if (type === 'opportunities') {
                    setOpportunities(prev => prev.filter(o => o.id !== id));
                } else {
                    setServices(prev => prev.filter(s => s.id !== id));
                }
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: result.error });
            }
        } finally {
            setUpdatingListingStatus(null);
        }
    };

    if (authLoading || pageLoading) {
        return <LoadingScreen />;
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                <p className="text-muted-foreground">Visão geral e gerenciamento da plataforma Táxiando SP.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Usuários Totais</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Visitas na Home</CardTitle><Eye className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics.pageViews?.home ?? 0}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Logins Totais</CardTitle><LogIn className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics.logins?.total ?? 0}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pacotes Vendidos</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analytics.sales?.packagesSold ?? 0}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Receita (Simulada)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(analytics.sales?.totalRevenue ?? 0)}</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Crescimento de Usuários</CardTitle>
                        <CardDescription>Esta área pode exibir um gráfico de crescimento futuro.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-md">
                            <p className="text-muted-foreground">Gráfico em breve</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle>Cadastros para Análise</CardTitle>
                        <CardDescription>Cadastros recentes que precisam de atenção.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {users.filter(u => u.profileStatus === 'pending_review').slice(0, 5).map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell><Badge variant={getStatusVariant(user.profileStatus)}>{user.profileStatus}</Badge></TableCell>
                                    </TableRow>
                                ))}
                                {users.filter(u => u.profileStatus === 'pending_review').length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">Nenhum cadastro pendente.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
                    <TabsTrigger value="opportunities">Moderar Locações</TabsTrigger>
                    <TabsTrigger value="services">Moderar Serviços</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Todos os Usuários</CardTitle>
                                    <CardDescription>Visualize e gerencie todos os usuários da plataforma.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Créditos</TableHead>
                                        <TableHead>Status do Perfil</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.uid}>
                                            <TableCell>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                            <TableCell className="font-medium">{user.credits ?? 0}</TableCell>
                                            <TableCell><Badge variant={getStatusVariant(user.profileStatus)}>{user.profileStatus}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem>Ver Perfil Completo</DropdownMenuItem>
                                                        {(user.profileStatus === 'Pendente' || user.profileStatus === 'pending_review') && (
                                                            updatingUserStatus === user.uid ? (
                                                                <DropdownMenuItem disabled>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Atualizando...
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleUserStatusUpdate(user.uid, 'Aprovado')}>Aprovar Cadastro</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => handleUserStatusUpdate(user.uid, 'Rejeitado')}>Rejeitar Cadastro</DropdownMenuItem>
                                                                </>
                                                            )
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="opportunities">
                    <Card>
                        <CardHeader>
                            <CardTitle>Moderar Oportunidades de Locação</CardTitle>
                            <CardDescription>Aprove ou rejeite os veículos anunciados para locação.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Veículo Anunciado</TableHead>
                                        <TableHead>Anunciante</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {opportunities.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma oportunidade pendente.</TableCell></TableRow>
                                    ) : (
                                        opportunities.map(opp => (
                                            <TableRow key={opp.id}>
                                                <TableCell className="font-medium">{opp.vehicle}</TableCell>
                                                <TableCell>{opp.provider}</TableCell>
                                                <TableCell><Badge variant={getStatusVariant(opp.status)}>{opp.status}</Badge></TableCell>
                                                <TableCell>
                                                     {opp.status === 'Pendente' && (
                                                        <div className="flex gap-2">
                                                            {updatingListingStatus === opp.id ? (
                                                                <Button variant="outline" size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</Button>
                                                            ) : (
                                                                <>
                                                                    <Button variant="outline" size="sm" onClick={() => handleListingApproval(opp.id, 'opportunities', 'Aprovado')}>Aprovar</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => handleListingApproval(opp.id, 'opportunities', 'Rejeitado')}>Rejeitar</Button>
                                                                </>
                                                            )}
                                                        </div>
                                                     )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>Moderar Serviços e Produtos</CardTitle>
                            <CardDescription>Aprove ou rejeite os anúncios dos prestadores de serviço.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título do Anúncio</TableHead>
                                        <TableHead>Prestador</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum serviço pendente.</TableCell></TableRow>
                                    ) : (
                                        services.map(srv => (
                                            <TableRow key={srv.id}>
                                                <TableCell className="font-medium">{srv.title}</TableCell>
                                                <TableCell>{srv.provider}</TableCell>
                                                <TableCell><Badge variant={getStatusVariant(srv.status)}>{srv.status}</Badge></TableCell>
                                                <TableCell>
                                                     {srv.status === 'Pendente' && (
                                                        <div className="flex gap-2">
                                                            {updatingListingStatus === srv.id ? (
                                                                <Button variant="outline" size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</Button>
                                                            ) : (
                                                                <>
                                                                    <Button variant="outline" size="sm" onClick={() => handleListingApproval(srv.id, 'services', 'Aprovado')}>Aprovar</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => handleListingApproval(srv.id, 'services', 'Rejeitado')}>Rejeitar</Button>
                                                                </>
                                                            )}
                                                        </div>
                                                     )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Configurações da Plataforma</CardTitle>
                                <CardDescription>Acesse as configurações de pagamento e outras opções.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/settings/payments">Gerenciar Configurações <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p>Clique no botão para configurar o gateway de pagamento (Mercado Pago) e outras definições da plataforma.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
