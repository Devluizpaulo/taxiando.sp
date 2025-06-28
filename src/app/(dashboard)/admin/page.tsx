
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Users, Briefcase, BookOpen, DollarSign, PackagePlus, ArrowRight, Calendar, Wrench } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

const users = [
    { id: 'usr_1', name: 'João da Silva', email: 'joao.silva@example.com', role: 'Motorista', profileStatus: 'Aprovado' },
    { id: 'usr_2', name: 'Frota Rápida SP', email: 'contato@frotarapida.com', role: 'Frota', profileStatus: 'N/A' },
    { id: 'usr_3', name: 'Maria Oliveira', email: 'maria.o@example.com', role: 'Motorista', profileStatus: 'Pendente' },
    { id: 'usr_4', name: 'Carlos Souza', email: 'carlos.souza@example.com', role: 'Motorista', profileStatus: 'Rejeitado' },
    { id: 'usr_5', name: 'Ana Pereira', email: 'ana.p@example.com', role: 'Motorista', profileStatus: 'Aprovado' },
    { id: 'usr_6', name: 'Pedro Martins', email: 'pedro.m@example.com', role: 'Motorista', profileStatus: 'Pendente' },
];


const opportunities = [
    { id: 'opp_1', title: 'Motorista Turno da Noite', company: 'Frota Rápida SP', status: 'Aprovado' },
    { id: 'opp_2', title: 'Vaga para Aeroporto GUA', company: 'Cooperativa Alfa', status: 'Pendente' },
    { id: 'opp_3', title: 'Motorista Fim de Semana', company: 'Táxi Legal', status: 'Rejeitado' },
    { id: 'opp_4', title: 'Motorista Bilíngue (Eventos)', company: 'SP TuriTaxi', status: 'Pendente' },
];

const serviceListings = [
    { id: 'srv_1', title: 'Despachante Veicular Completo', provider: 'Despachante Legal', status: 'Pendente' },
    { id: 'srv_2', title: 'Curso de Reciclagem para Taxistas', provider: 'Autoescola Futuro', status: 'Aprovado' },
    { id: 'srv_3', title: 'Instalação de GNV 5ª Geração', provider: 'GNV Master', status: 'Rejeitado' },
    { id: 'srv_4', title: 'Troca de Óleo e Filtro', provider: 'Oficina do Zé', status: 'Pendente' },
];


const courses = [
    { id: 'crs_1', name: 'Legislação de Trânsito', enrolled: 152, completion: '85%' },
    { id: 'crs_2', name: 'Inglês para Atendimento', enrolled: 98, completion: '62%' },
    { id: 'crs_3', name: 'Direção Defensiva', enrolled: 210, completion: '91%' },
];

const chartData = [
  { month: "Jan", users: 50 },
  { month: "Fev", users: 75 },
  { month: "Mar", users: 120 },
  { month: "Abr", users: 110 },
  { month: "Mai", users: 180 },
  { month: "Jun", users: 230 },
];

const getProfileStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Aprovado': return 'default';
        case 'Pendente': return 'secondary';
        case 'Rejeitado': return 'destructive';
        default: return 'outline';
    }
};

export default function AdminPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    useEffect(() => {
        if (!loading && (!userProfile || userProfile.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [userProfile, loading, router]);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedUsers(users.filter(u => u.role === 'Motorista').map(u => u.id));
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

    const handleApproval = (action: 'approve' | 'reject', id: string, type: 'opportunity' | 'service') => {
        console.log(`${action} ${type} ${id}`);
        // Aqui você implementaria a lógica para aprovar/rejeitar a oportunidade
    };

    if (loading || !userProfile || userProfile.role !== 'admin') {
      return (
        <div className="flex flex-col gap-8">
          <Skeleton className="h-10 w-1/2" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-96" />
        </div>
      );
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                <p className="text-muted-foreground">Visão geral e gerenciamento da plataforma Táxiando SP.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Oportunidades Ativas</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{opportunities.length}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{courses.length}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita (Mês)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">R$ 15.231,89</div></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Crescimento de Usuários</CardTitle>
                        <CardDescription>Novos usuários cadastrados nos últimos 6 meses.</CardDescription>
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
                        <CardTitle>Análise de Cadastros Recentes</CardTitle>
                        <CardDescription>Os últimos 5 cadastros que precisam de atenção.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {users.filter(u => u.profileStatus !== 'N/A').slice(0,5).map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell><Badge variant={getProfileStatusVariant(user.profileStatus)}>{user.profileStatus}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
                    <TabsTrigger value="opportunities">Moderar Vagas</TabsTrigger>
                    <TabsTrigger value="services">Moderar Serviços</TabsTrigger>
                    <TabsTrigger value="courses">Gerenciar Cursos</TabsTrigger>
                    <TabsTrigger value="events">Gerenciar Eventos</TabsTrigger>
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
                                        <TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} checked={selectedUsers.length > 0 && selectedUsers.length === users.filter(u => u.role === 'Motorista').length} /></TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead>Status do Perfil</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell><Checkbox 
                                                disabled={user.role !== 'Motorista'}
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                                            /></TableCell>
                                            <TableCell>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell><Badge variant={getProfileStatusVariant(user.profileStatus)}>{user.profileStatus}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem>Ver Perfil Completo</DropdownMenuItem>
                                                        {user.role === 'Motorista' && user.profileStatus === 'Pendente' && <>
                                                            <DropdownMenuItem>Aprovar Cadastro</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Rejeitar Cadastro</DropdownMenuItem>
                                                        </>}
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
                            <CardTitle>Moderar Vagas de Emprego</CardTitle>
                            <CardDescription>Aprove ou rejeite as vagas postadas pelas frotas na plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título da Vaga</TableHead>
                                        <TableHead>Empresa (Frota)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {opportunities.map(opp => (
                                        <TableRow key={opp.id}>
                                            <TableCell className="font-medium">{opp.title}</TableCell>
                                            <TableCell>{opp.company}</TableCell>
                                            <TableCell><Badge variant={getProfileStatusVariant(opp.status)}>{opp.status}</Badge></TableCell>
                                            <TableCell>
                                                 {opp.status === 'Pendente' && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleApproval('approve', opp.id, 'opportunity')}>Aprovar</Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleApproval('reject', opp.id, 'opportunity')}>Rejeitar</Button>
                                                    </div>
                                                 )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                                    {serviceListings.map(srv => (
                                        <TableRow key={srv.id}>
                                            <TableCell className="font-medium">{srv.title}</TableCell>
                                            <TableCell>{srv.provider}</TableCell>
                                            <TableCell><Badge variant={getProfileStatusVariant(srv.status)}>{srv.status}</Badge></TableCell>
                                            <TableCell>
                                                 {srv.status === 'Pendente' && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleApproval('approve', srv.id, 'service')}>Aprovar</Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleApproval('reject', srv.id, 'service')}>Rejeitar</Button>
                                                    </div>
                                                 )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome do Curso</TableHead>
                                        <TableHead>Inscritos</TableHead>
                                        <TableHead>Taxa de Conclusão</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map(course => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell>{course.enrolled}</TableCell>
                                            <TableCell>{course.completion}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                                <p className="font-semibold">Nenhum evento agendado recentemente.</p>
                                <p className="text-sm">Clique no botão para adicionar novos shows, feiras e outros acontecimentos importantes na cidade.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
