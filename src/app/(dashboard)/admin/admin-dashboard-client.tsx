
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Users, Briefcase, BookOpen, DollarSign, PackagePlus, ArrowRight, Calendar, CreditCard, ShoppingCart, Loader2, Eye, LogIn, UserCheck, Search, Trash2, FilePen, Sparkles, Building, Settings, Car, Wrench, Shield, Newspaper, Library, ImageIcon, Tag, Mail, Megaphone, Handshake, LifeBuoy, Star } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { updateListingStatus, getAdminDashboardData } from '@/app/actions/admin-actions';
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
    
    const [updatingListingStatus, setUpdatingListingStatus] = useState<string | null>(null);

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

            <Tabs defaultValue="opportunities">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                    <TabsTrigger value="opportunities">Moderar Locações</TabsTrigger>
                    <TabsTrigger value="services">Moderar Serviços</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>
                
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
                         <Image src={vehicle.imageUrls?.[0] || 'https://placehold.co/800x600.png'} alt={`${vehicle.make} ${vehicle.model}`} width={800} height={600} className="w-full rounded-lg object-cover aspect-video" data-ai-hint="car side view"/>
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
                     {service.imageUrls?.[0] && <Image src={service.imageUrls[0]} alt={service.title} width={800} height={400} className="w-full rounded-lg object-cover aspect-video" data-ai-hint="tools workshop"/>}
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
