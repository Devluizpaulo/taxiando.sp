
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthProtection } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Users, Briefcase, BookOpen, DollarSign, PackagePlus, ArrowRight, Calendar, CreditCard, ShoppingCart, Loader2, Eye, LogIn, UserCheck, Search } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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
        case 'incomplete':
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
    
    const [updatingUserStatus, setUpdatingUserStatus] = useState<string | null>(null);
    const [updatingListingStatus, setUpdatingListingStatus] = useState<string | null>(null);

    // State for user filtering and modal
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const nameMatch = user.name?.toLowerCase().includes(searchLower);
            const emailMatch = user.email.toLowerCase().includes(searchLower);
            
            let roleMatch = roleFilter === 'all' || user.role === roleFilter;
            // Map our DB statuses to the filter options
            let statusMatch = statusFilter === 'all';
            if (statusFilter === 'approved') statusMatch = user.profileStatus === 'approved';
            if (statusFilter === 'pending') statusMatch = user.profileStatus === 'pending_review';
            if (statusFilter === 'rejected') statusMatch = user.profileStatus === 'rejected';
            if (statusFilter === 'incomplete') statusMatch = user.profileStatus === 'incomplete' || !user.profileStatus;

            return (nameMatch || emailMatch) && roleMatch && statusMatch;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);
    
    const handleUserStatusUpdate = async (userId: string, newStatus: 'Aprovado' | 'Rejeitado' | 'Pendente') => {
        setUpdatingUserStatus(userId);
        try {
            const result = await updateUserProfileStatus(userId, newStatus);
            if (result.success) {
                toast({ title: 'Sucesso', description: 'Status do usuário atualizado.' });
                setUsers(prev => prev.map(u => u.uid === userId ? { ...u, profileStatus: result.dbStatus } : u));
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
                        <CardDescription>Novos usuários cadastrados nos últimos 12 meses.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.userGrowth}>
                                <XAxis
                                    dataKey="month"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))'
                                    }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
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
                            <CardTitle>Todos os Usuários</CardTitle>
                            <CardDescription>Filtre e gerencie todos os usuários da plataforma.</CardDescription>
                             <div className="mt-4 flex flex-col items-center gap-4 md:flex-row">
                                <div className="relative w-full md:flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="flex w-full gap-4 md:w-auto">
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Filtrar por Perfil" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Perfis</SelectItem>
                                        <SelectItem value="driver">Motorista</SelectItem>
                                        <SelectItem value="fleet">Frota</SelectItem>
                                        <SelectItem value="provider">Prestador</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Filtrar por Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="approved">Aprovado</SelectItem>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="rejected">Rejeitado</SelectItem>
                                        <SelectItem value="incomplete">Incompleto</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    {filteredUsers.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum usuário encontrado com esses filtros.</TableCell></TableRow>
                                    ) : (
                                    filteredUsers.map(user => (
                                        <TableRow key={user.uid}>
                                            <TableCell>
                                                <div className="font-medium">{user.name || user.nomeFantasia || 'Usuário sem nome'}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                            <TableCell className="font-medium">{user.credits ?? 0}</TableCell>
                                            <TableCell><Badge variant={getStatusVariant(user.profileStatus)}>{user.profileStatus || 'N/A'}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setProfileModalOpen(true); }}>Ver Perfil Completo</DropdownMenuItem>
                                                        {(user.profileStatus === 'Pendente' || user.profileStatus === 'pending_review') && (
                                                            updatingUserStatus === user.uid ? (
                                                                <DropdownMenuItem disabled>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Atualizando...
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleUserStatusUpdate(user.uid, 'Aprovado')}><UserCheck className="mr-2 h-4 w-4"/> Aprovar Cadastro</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => handleUserStatusUpdate(user.uid, 'Rejeitado')}>Rejeitar Cadastro</DropdownMenuItem>
                                                                </>
                                                            )
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )))}
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
             <UserProfileModal user={selectedUser} isOpen={isProfileModalOpen} onOpenChange={setProfileModalOpen} />
        </div>
    );
}


function UserProfileModal({ user, isOpen, onOpenChange }: { user: AdminUser | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!user) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detalhes do Perfil: {user.name || user.nomeFantasia || user.email}</DialogTitle>
                    <DialogDescription>
                        Informações detalhadas do cadastro do usuário.
                    </DialogDescription>
                </DialogHeader>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-4 border-r-0 md:border-r md:pr-8">
                        <h4 className="font-semibold text-lg border-b pb-2">Informações Gerais</h4>
                        <p><strong>Nome/Fantasia:</strong> {user.name || user.nomeFantasia || 'Não informado'}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Telefone:</strong> {user.phone || 'Não informado'}</p>
                        <p><strong>Perfil:</strong> <Badge variant="secondary">{user.role}</Badge></p>
                        <p><strong>Status:</strong> <Badge variant={getStatusVariant(user.profileStatus)}>{user.profileStatus || 'N/A'}</Badge></p>
                        <p><strong>Créditos:</strong> {user.credits || 0}</p>
                        <p><strong>Membro desde:</strong> {formatDate(user.createdAt)}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Documentos</h4>
                        {user.role === 'driver' ? (
                            <>
                                <p><strong>Nº CNH:</strong> {user.cnhNumber || 'Não informado'}</p>
                                <p><strong>Cat. CNH:</strong> {user.cnhCategory || 'Não informado'}</p>
                                <p><strong>Venc. CNH:</strong> {formatDate(user.cnhExpiration)}</p>
                                <p><strong>Nº Condutax:</strong> {user.condutaxNumber || 'Não informado'}</p>
                                <p><strong>Venc. Condutax:</strong> {formatDate(user.condutaxExpiration)}</p>
                                <p><strong>Placa Veículo:</strong> {user.vehicleLicensePlate || 'Não informado'}</p>
                                <p><strong>Venc. Alvará:</strong> {formatDate(user.alvaraExpiration)}</p>
                            </>
                        ) : user.role === 'fleet' || user.role === 'provider' ? (
                             <>
                                <p><strong>Tipo:</strong> {user.personType === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                                <p><strong>CPF:</strong> {user.cpf || 'Não informado'}</p>
                                <p><strong>CNPJ:</strong> {user.cnpj || 'Não informado'}</p>
                                <p><strong>Razão Social:</strong> {user.razaoSocial || 'Não informado'}</p>
                             </>
                        ) : (
                            <p className="text-muted-foreground">Usuário não possui documentos específicos.</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Fechar
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

