
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Eye, Star, Wrench, Tag, DollarSign, FilePen, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data
const mockServices = [
  { id: 'srv_1', title: 'Despachante Veicular Completo', category: 'Despachante', price: 'R$ 550,00', status: 'Ativo', views: 120, rating: 4.9 },
  { id: 'srv_2', title: 'Curso de Reciclagem para Taxistas', category: 'Autoescola', price: 'R$ 300,00', status: 'Ativo', views: 85, rating: 4.8 },
  { id: 'srv_3', title: 'Troca de Óleo e Filtro', category: 'Oficina Mecânica', price: 'R$ 180,00', status: 'Pausado', views: 210, rating: 5.0 },
  { id: 'srv_4', title: 'Instalação de GNV 5ª Geração', category: 'Instaladora GNV', price: 'Sob Consulta', status: 'Ativo', views: 350, rating: 4.9 },
];


export default function ServicesPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();
    const [services, setServices] = useState(mockServices);

    useEffect(() => {
        if (!loading && (!userProfile || !['provider', 'admin'].includes(userProfile.role))) {
            router.push('/dashboard');
        }
    }, [userProfile, loading, router]);

    if (loading || !userProfile || !['provider', 'admin'].includes(userProfile.role)) {
        return (
          <div className="flex flex-col gap-8">
            <Skeleton className="h-10 w-1/2" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <h1 className="font-headline text-3xl font-bold tracking-tight">Painel do Prestador</h1>
                <p className="text-muted-foreground">Gerencie seus serviços, anúncios e visualize seu desempenho.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{services.filter(s => s.status === 'Ativo').length}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads (Mês)</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">42</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold flex items-center">4.9 <span className="text-xs text-muted-foreground ml-1">/ 5</span></div></CardContent>
                </Card>
            </div>

             <Card className="bg-accent/30 border-accent/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Complete o Perfil da sua Empresa</CardTitle>
                        <CardDescription>Um perfil completo atrai mais clientes. Adicione sua descrição, endereço e redes sociais.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/services/profile">
                            Completar Perfil <ChevronRight />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Meus Anúncios</CardTitle>
                        <CardDescription>Adicione, edite e gerencie a visibilidade dos seus serviços na plataforma.</CardDescription>
                    </div>
                    <Button asChild><Link href="/services/create"><PlusCircle /> Criar Novo Anúncio</Link></Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serviço</TableHead>
                                <TableHead><Tag className="inline-block h-4 w-4 mr-1"/>Categoria</TableHead>
                                <TableHead><DollarSign className="inline-block h-4 w-4 mr-1"/>Preço</TableHead>
                                <TableHead>Visibilidade</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map(service => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.title}</TableCell>
                                    <TableCell>{service.category}</TableCell>
                                    <TableCell>{service.price}</TableCell>
                                    <TableCell>
                                        <Badge variant={service.status === 'Ativo' ? 'default' : 'secondary'}>
                                            {service.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem><FilePen /> Editar</DropdownMenuItem>
                                                <DropdownMenuItem className={service.status === 'Ativo' ? '' : 'text-green-600'}>
                                                    {service.status === 'Ativo' ? 'Pausar Anúncio' : 'Reativar'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Remover</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
