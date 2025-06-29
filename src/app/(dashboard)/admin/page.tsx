
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthProtection } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { LoadingScreen } from '@/components/loading-screen';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Users, Briefcase, BookOpen, DollarSign, PackagePlus, ArrowRight, Calendar, CreditCard, ShoppingCart, Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Checkbox } from '@/components/ui/checkbox';

import { updateUserProfileStatus, updateListingStatus } from '@/app/actions/admin-actions';
import type { UserProfile } from '@/lib/types';
import type { Opportunity, ServiceListing, Course, CreditPackage, Event } from '@/lib/types';


type AdminUser = Pick<UserProfile, 'uid' | 'name' | 'email' | 'role' | 'profileStatus' | 'createdAt'>;

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

export default function AdminPage() {
    const { loading: authLoading } = useAuthProtection({ requiredRoles: ['admin'] });
    const { toast } = useToast();

    const [loadingData, setLoadingData] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [chartData, setChartData] = useState<{ month: string, users: number }[]>([]);

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [updatingUserStatus, setUpdatingUserStatus] = useState<string | null>(null);
    const [updatingListingStatus, setUpdatingListingStatus] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersSnapshot, oppsSnapshot, servicesSnapshot, coursesSnapshot, packagesSnapshot, eventsSnapshot] = await Promise.all([
                    getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
                    getDocs(query(collection(db, 'opportunities'), where('status', '==', 'Pendente'))),
                    getDocs(query(collection(db, 'services'), where('status', '==', 'Pendente'))),
                    getDocs(collection(db, 'courses')),
                    getDocs(collection(db, 'credit_packages')),
                    getDocs(query(collection(db, 'events'), orderBy('startDate', 'desc'), where('startDate', '>=', new Date())))
                ]);

                const usersData = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AdminUser));
                setUsers(usersData);

                const oppsData = oppsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
                setOpportunities(oppsData);

                const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceListing));
                setServices(servicesData);
                
                const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(coursesData);
                
                const packagesData = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditPackage));
                setPackages(packagesData);

                const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
                setEvents(eventsData);
                
                // Process chart data
                const monthlySignups: { [key: string]: number } = {};
                usersData.forEach(user => {
                    if (user.createdAt) {
                        const date = (user.createdAt as Timestamp).toDate();
                        const month = format(date, "MMM");
                        monthlySignups[month] = (monthlySignups[month] || 0) + 1;
                    }
                });
                const chartDataFormatted = Object.keys(monthlySignups).map(month => ({ month, users: monthlySignups[month] }));
                setChartData(chartDataFormatted);


            } catch (error) {
                console.error("Failed to fetch admin data:", error);
                toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível buscar os dados do painel.' });
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [toast]);

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

    if (authLoading || loadingData) {
      return <LoadingScreen />;
    }

    const pendingUsers = users.filter(u => u.profileStatus && u.profileStatus !== 'approved' && u.profileStatus !== 'N/A').slice(0, 5);
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                <p className="text-muted-foreground">Visão geral e gerenciamento da plataforma Táxiando SP.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Usuários Totais</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pendentes (Locação)</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{opportunities.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{courses.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pacotes de Crédito</CardTitle><CreditCard className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{packages.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Receita (Mês)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ 0,00</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Crescimento de Usuários</CardTitle>
                        <CardDescription>Novos usuários cadastrados nos últimos meses.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle>Cadastros Recentes para Análise</CardTitle>
                        <CardDescription>Os últimos cadastros que precisam de atenção.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {pendingUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">Nenhum cadastro pendente.</TableCell>
                                    </TableRow>
                                ) : (
                                    pendingUsers.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell><Badge variant={getStatusVariant(user.profileStatus)}>{user.profileStatus}</Badge></TableCell>
                                    </TableRow>
                                )))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
                    <TabsTrigger value="opportunities">Moderar Locações</TabsTrigger>
                    <TabsTrigger value="services">Moderar Serviços</TabsTrigger>
                    <TabsTrigger value="courses">Gerenciar Cursos</TabsTrigger>
                    <TabsTrigger value="events">Gerenciar Eventos</TabsTrigger>
                    <TabsTrigger value="billing">Gerenciar Créditos</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Todos os Usuários</CardTitle>
                                    <CardDescription>Visualize, gerencie e agrupe motoristas para frotas.</CardDescription>
                                </div>
                                <Button disabled={selectedUsers.length === 0}><PackagePlus /> Criar Pacote ({selectedUsers.length})</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} checked={selectedUsers.length > 0 && selectedUsers.length === users.filter(u => u.role === 'driver').map(u => u.uid).length} /></TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Status do Perfil</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">Nenhum usuário encontrado. Cadastre o primeiro!</TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map(user => (
                                            <TableRow key={user.uid}>
                                                <TableCell><Checkbox 
                                                    disabled={user.role !== 'driver'}
                                                    checked={selectedUsers.includes(user.uid)}
                                                    onCheckedChange={(checked) => handleSelectUser(user.uid, !!checked)}
                                                /></TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell><Badge variant={getStatusVariant(user.profileStatus)}>{user.profileStatus}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                            <DropdownMenuItem>Ver Perfil Completo</DropdownMenuItem>
                                                            {user.role === 'driver' && (user.profileStatus === 'Pendente' || user.profileStatus === 'pending_review') && (
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
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="opportunities">
                    <Card>
                        <CardHeader>
                            <CardTitle>Moderar Oportunidades de Locação</CardTitle>
                            <CardDescription>Aprove ou rejeite os veículos anunciados para locação por frotas ou particulares (Porta Branca).</CardDescription>
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
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">Nenhuma oportunidade de locação pendente.</TableCell>
                                        </TableRow>
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
                            <CardDescription>Aprove ou rejeite os anúncios postados pelos prestadores de serviço.</CardDescription>
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
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">Nenhum serviço pendente de moderação.</TableCell>
                                        </TableRow>
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
                <TabsContent value="courses">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Gerenciar Cursos</CardTitle>
                                <CardDescription>Acesse o painel completo para adicionar e editar cursos.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/courses">Gerenciar Cursos <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p>{courses.length} cursos cadastrados. Acesse a página de gerenciamento para mais detalhes.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="events">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Agenda Cultural</CardTitle>
                                <CardDescription>Crie e gerencie os eventos que aparecerão na página inicial.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/events">Gerenciar Eventos <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                                 <Calendar className="h-12 w-12 mb-4" />
                                <p className="font-semibold">{events.length} eventos futuros cadastrados.</p>
                                <p className="text-sm">Clique no botão para adicionar novos shows, feiras e outros acontecimentos importantes na cidade.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="billing">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Pacotes de Crédito</CardTitle>
                                <CardDescription>Crie e gerencie os pacotes para compra na plataforma.</CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/admin/billing">Gerenciar Pacotes <ArrowRight className="ml-2"/></Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                           <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                                 <ShoppingCart className="h-12 w-12 mb-4" />
                                <p className="font-semibold">{packages.length} pacotes de crédito criados.</p>
                                <p className="text-sm">Clique no botão para criar pacotes de créditos que os usuários poderão comprar.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    