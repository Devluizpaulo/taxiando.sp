
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Users, Briefcase, BookOpen, DollarSign, PackagePlus, ArrowRight, Calendar, CreditCard, ShoppingCart, Loader2, Eye, LogIn, UserCheck, Search, Trash2, FilePen, Sparkles, Building, Settings } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { updateUserProfileStatus, updateListingStatus, getAdminDashboardData, updateUserByAdmin, deleteUserByAdmin } from '@/app/actions/admin-actions';
import { getVehicleDetails } from '@/app/actions/fleet-actions';
import { getServiceAndProviderDetails } from '@/app/actions/service-actions';
import type { UserProfile, Vehicle, ServiceListing, AnalyticsData, AdminUser } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import { vehiclePerks } from '@/lib/data';


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
    const { toast } = useToast();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
    const [isDeleting, setIsDeleting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

    // State for moderation modals
    const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [selectedVehicleFleet, setSelectedVehicleFleet] = useState<UserProfile | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);
    const [selectedServiceProvider, setSelectedServiceProvider] = useState<UserProfile | null>(null);


     useEffect(() => {
        const fetchData = async () => {
            setPageLoading(true);
            try {
                const data = await getAdminDashboardData();
                setUsers(data.users);
                setVehicles(data.vehicles);
                setServices(data.services);
                setAnalytics(data.analytics);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro ao Carregar Painel', description: 'Não foi possível carregar os dados do painel. Tente recarregar a página.' });
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchLower = searchTerm.toLowerCase();
            const nameMatch = user.name?.toLowerCase().includes(searchLower) || user.nomeFantasia?.toLowerCase().includes(searchLower);
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

    const handleListingApproval = async (id: string, type: 'vehicles' | 'services', newStatus: 'Aprovado' | 'Rejeitado') => {
        setUpdatingListingStatus(id);
        try {
            const result = await updateListingStatus(id, type, newStatus);
            if (result.success) {
                toast({ title: 'Sucesso', description: `Status do anúncio atualizado para ${newStatus}.`});
                if (type === 'vehicles') {
                    setVehicles(prev => prev.filter(o => o.id !== id));
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

    const confirmUserDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        const result = await deleteUserByAdmin(userToDelete.uid);
        if (result.success) {
            toast({ title: 'Usuário Removido', description: `O usuário ${userToDelete.name || userToDelete.email} foi removido.` });
            setUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
        setIsDeleting(false);
        setUserToDelete(null);
    };

    const handleViewVehicleDetails = async (vehicleId: string) => {
        setIsFetchingDetails(true);
        const result = await getVehicleDetails(vehicleId);
        if (result.success && result.vehicle && result.fleet) {
            setSelectedVehicle(result.vehicle);
            setSelectedVehicleFleet(result.fleet);
            setVehicleModalOpen(true);
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os detalhes do veículo.' });
        }
        setIsFetchingDetails(false);
    };
    
    const handleViewServiceDetails = async (serviceId: string) => {
        setIsFetchingDetails(true);
        const result = await getServiceAndProviderDetails(serviceId);
        if (result.success && result.service && result.provider) {
            setSelectedService(result.service);
            setSelectedServiceProvider(result.provider);
            setServiceModalOpen(true);
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os detalhes do serviço.' });
        }
        setIsFetchingDetails(false);
    };


    if (pageLoading) {
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
                                                        <DropdownMenuItem onSelect={() => { setSelectedUser(user); setProfileModalOpen(true); }}><FilePen className="mr-2"/> Editar Perfil</DropdownMenuItem>
                                                        {(user.profileStatus === 'Pendente' || user.profileStatus === 'pending_review') && (
                                                            updatingUserStatus === user.uid ? (
                                                                <DropdownMenuItem disabled>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Atualizando...
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleUserStatusUpdate(user.uid, 'Aprovado')}><UserCheck className="mr-2 h-4 w-4"/> Aprovar Cadastro</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground" onClick={() => handleUserStatusUpdate(user.uid, 'Rejeitado')}>Rejeitar Cadastro</DropdownMenuItem>
                                                                </>
                                                            )
                                                        )}
                                                        <DropdownMenuSeparator />
                                                         <DropdownMenuItem onSelect={() => setUserToDelete(user)} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                                                            <Trash2 className="mr-2" /> Remover Usuário
                                                        </DropdownMenuItem>
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
                            <CardTitle>Moderar Anúncios de Veículos</CardTitle>
                            <CardDescription>Aprove ou rejeite os veículos anunciados para locação.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Veículo Anunciado</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicles.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="h-24 text-center">Nenhuma locação pendente.</TableCell></TableRow>
                                    ) : (
                                        vehicles.map(vehicle => (
                                            <TableRow key={vehicle.id}>
                                                <TableCell className="font-medium">
                                                    <Button variant="link" className="p-0 h-auto" onClick={() => handleViewVehicleDetails(vehicle.id)} disabled={isFetchingDetails}>
                                                        {vehicle.make} {vehicle.model} ({vehicle.plate})
                                                    </Button>
                                                </TableCell>
                                                <TableCell><Badge variant={getStatusVariant(vehicle.moderationStatus)}>{vehicle.moderationStatus}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    {vehicle.moderationStatus === 'Pendente' && (
                                                        <div className="flex gap-2 justify-end">
                                                            {updatingListingStatus === vehicle.id ? (
                                                                <Button variant="outline" size="sm" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</Button>
                                                            ) : (
                                                                <>
                                                                    <Button variant="outline" size="sm" onClick={() => handleListingApproval(vehicle.id, 'vehicles', 'Aprovado')}>Aprovar</Button>
                                                                    <Button variant="destructive" size="sm" onClick={() => handleListingApproval(vehicle.id, 'vehicles', 'Rejeitado')}>Rejeitar</Button>
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
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum serviço pendente.</TableCell></TableRow>
                                    ) : (
                                        services.map(srv => (
                                            <TableRow key={srv.id}>
                                                <TableCell className="font-medium">
                                                    <Button variant="link" className="p-0 h-auto" onClick={() => handleViewServiceDetails(srv.id)} disabled={isFetchingDetails}>
                                                        {srv.title}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>{srv.provider}</TableCell>
                                                <TableCell><Badge variant={getStatusVariant(srv.status)}>{srv.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    {srv.status === 'Pendente' && (
                                                        <div className="flex gap-2 justify-end">
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
                                <CardDescription>Acesse as configurações de pagamento, temas e outras opções.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/settings">Gerenciar Configurações <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p>Clique no botão para gerenciar gateways de pagamento, aparência do site e outras definições.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             <UserEditModal 
                user={selectedUser} 
                isOpen={isProfileModalOpen} 
                onOpenChange={setProfileModalOpen} 
                onUserUpdate={(updatedUser) => {
                    setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
                }}
             />

             <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá remover permanentemente o usuário <span className="font-bold">{userToDelete?.name || userToDelete?.email}</span> e todos os seus dados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUserDelete} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="mr-2 animate-spin"/>}
                            Sim, remover usuário
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <VehicleDetailsModal
                isOpen={isVehicleModalOpen}
                onOpenChange={setVehicleModalOpen}
                vehicle={selectedVehicle}
                fleet={selectedVehicleFleet}
            />
            <ServiceDetailsModal
                isOpen={isServiceModalOpen}
                onOpenChange={setServiceModalOpen}
                service={selectedService}
                provider={selectedServiceProvider}
            />
        </div>
    );
}


const adminEditUserSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório.").optional().or(z.literal('')),
  phone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos.").optional().or(z.literal('')),
  role: z.enum(['driver', 'fleet', 'provider', 'admin']),
  profileStatus: z.enum(['incomplete', 'pending_review', 'approved', 'rejected']),
  credits: z.coerce.number().min(0, "Créditos não podem ser negativos."),
});

type AdminEditUserFormValues = z.infer<typeof adminEditUserSchema>;


function UserEditModal({ user, isOpen, onOpenChange, onUserUpdate }: { user: AdminUser | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onUserUpdate: (user: AdminUser) => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<AdminEditUserFormValues>({
        resolver: zodResolver(adminEditUserSchema),
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || user.nomeFantasia || '',
                phone: user.phone || '',
                role: user.role,
                profileStatus: user.profileStatus as any || 'incomplete',
                credits: user.credits || 0,
            });
        }
    }, [user, form]);

    if (!user) return null;

    const onSubmit = async (values: AdminEditUserFormValues) => {
        setIsSubmitting(true);
        const result = await updateUserByAdmin(user.uid, values);

        if (result.success) {
            toast({ title: 'Sucesso!', description: 'Perfil do usuário atualizado.' });
            onUserUpdate({ ...user, ...values });
            onOpenChange(false);
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Atualizar', description: result.error as string || 'Não foi possível salvar os dados.'});
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar Perfil: {user.name || user.nomeFantasia || user.email}</DialogTitle>
                    <DialogDescription>
                        Altere as informações do usuário abaixo. Alterações são salvas permanentemente.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo / Fantasia</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input value={user.email} disabled /></FormControl>
                            <FormDescription>O email não pode ser alterado por um administrador por razões de segurança.</FormDescription>
                        </FormItem>
                         <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Perfil</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="driver">Motorista</SelectItem>
                                                <SelectItem value="fleet">Frota</SelectItem>
                                                <SelectItem value="provider">Prestador</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="profileStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status do Perfil</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="approved">Aprovado</SelectItem>
                                                <SelectItem value="pending_review">Pendente</SelectItem>
                                                <SelectItem value="rejected">Rejeitado</SelectItem>
                                                <SelectItem value="incomplete">Incompleto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="credits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Créditos</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 animate-spin"/>}
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function VehicleDetailsModal({ isOpen, onOpenChange, vehicle, fleet }: { isOpen: boolean, onOpenChange: (open: boolean) => void, vehicle: Vehicle | null, fleet: UserProfile | null }) {
    if (!vehicle || !fleet) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Detalhes da Oportunidade</DialogTitle>
                    <DialogDescription>
                        Revise os detalhes do veículo antes de aprovar ou rejeitar o anúncio.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-4">
                         <Image src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} width={800} height={600} className="w-full rounded-lg object-cover aspect-video" data-ai-hint="car side view"/>
                         <Card>
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-base flex items-center gap-2"><Building /> Anunciado por</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <p className="font-semibold">{fleet.nomeFantasia || fleet.name}</p>
                                 <p className="text-sm text-muted-foreground">{fleet.email}</p>
                             </CardContent>
                         </Card>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-headline">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Placa: {vehicle.plate}</Badge>
                            <Badge variant="outline">Condição: {vehicle.condition}</Badge>
                             <Badge variant="default" className="text-lg">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.dailyRate)} / dia
                            </Badge>
                        </div>
                         <Card>
                             <CardHeader className="pb-2"><CardTitle className="text-base">Descrição</CardTitle></CardHeader>
                             <CardContent><p className="text-sm text-muted-foreground">{vehicle.description}</p></CardContent>
                         </Card>
                         <Card>
                             <CardHeader className="pb-2"><CardTitle className="text-base">Vantagens Inclusas</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-2 gap-2 text-sm">
                                {vehicle.perks.map(perk => {
                                    const PerkIcon = vehiclePerks.find(p => p.id === perk.id)?.icon || Sparkles;
                                    return (
                                        <div key={perk.id} className="flex items-center gap-2">
                                            <PerkIcon className="h-4 w-4 text-primary" />
                                            <span>{perk.label}</span>
                                        </div>
                                    )
                                })}
                                {vehicle.perks.length === 0 && <p className="text-muted-foreground">Nenhuma vantagem informada.</p>}
                             </CardContent>
                         </Card>
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ServiceDetailsModal({ isOpen, onOpenChange, service, provider }: { isOpen: boolean, onOpenChange: (open: boolean) => void, service: ServiceListing | null, provider: UserProfile | null }) {
    if (!service || !provider) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalhes do Serviço</DialogTitle>
                    <DialogDescription>
                        Revise os detalhes do anúncio antes de aprovar ou rejeitar.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                     {service.imageUrl && <Image src={service.imageUrl} alt={service.title} width={800} height={400} className="w-full rounded-lg object-cover aspect-video" data-ai-hint="tools workshop"/>}
                     <h3 className="text-2xl font-bold font-headline">{service.title}</h3>
                     <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{service.category}</Badge>
                        <Badge variant="default">{service.price}</Badge>
                     </div>
                     <p className="text-muted-foreground pt-2">{service.description}</p>
                     <Card>
                         <CardHeader className="pb-2">
                             <CardTitle className="text-base flex items-center gap-2"><Building /> Oferecido por</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <p className="font-semibold">{provider.nomeFantasia || provider.name}</p>
                             <p className="text-sm text-muted-foreground">{provider.email}</p>
                         </CardContent>
                     </Card>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
