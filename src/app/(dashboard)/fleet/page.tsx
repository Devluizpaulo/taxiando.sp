'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Users, Eye, PlusCircle, Search, Star, MoreHorizontal, Wrench, Trash2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const vehicles = [
  { id: 'v_1', plate: 'BRA2E19', model: 'Chevrolet Onix', year: 2022, status: 'Disponível', dailyRate: 'R$ 120,00', image: 'https://placehold.co/80x60.png' },
  { id: 'v_2', plate: 'RJZ1I55', model: 'Hyundai HB20', year: 2023, status: 'Alugado', dailyRate: 'R$ 135,00', image: 'https://placehold.co/80x60.png' },
  { id: 'v_3', plate: 'FKT8J21', model: 'Fiat Cronos', year: 2021, status: 'Em Manutenção', dailyRate: 'R$ 110,00', image: 'https://placehold.co/80x60.png' },
];

const drivers = [
    { id: 'd_1', name: 'Carlos Pereira', rating: 4.9, completedTrips: 1500, avatar: 'https://placehold.co/40x40.png' },
    { id: 'd_2', name: 'Ana Costa', rating: 4.8, completedTrips: 950, avatar: 'https://placehold.co/40x40.png' },
    { id: 'd_3', name: 'Ricardo Alves', rating: 4.9, completedTrips: 2100, avatar: 'https://placehold.co/40x40.png' },
];

const getVehicleStatusVariant = (status: string) => {
    switch (status) {
        case 'Disponível': return 'default';
        case 'Alugado': return 'secondary';
        case 'Em Manutenção': return 'destructive';
        default: return 'outline';
    }
};

export default function FleetPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!userProfile || !['fleet', 'admin'].includes(userProfile.role))) {
            router.push('/dashboard');
        }
    }, [userProfile, loading, router]);

    if (loading || !userProfile || !['fleet', 'admin'].includes(userProfile.role)) {
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
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Painel da Frota</h1>
                <p className="text-muted-foreground">Gerencie seus veículos e encontre os melhores motoristas.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">12</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Motoristas Compatíveis</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">250+</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avaliação da Frota</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold flex items-center">4.8 <span className="text-xs text-muted-foreground ml-1">/ 5</span></div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas ao Perfil (Mês)</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">1,432</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Meus Veículos</CardTitle>
                        <CardDescription>Visualize e gerencie todos os veículos da sua frota.</CardDescription>
                    </div>
                    <Button><PlusCircle /> Cadastrar Novo Veículo</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Veículo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Diária</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map(vehicle => (
                                <TableRow key={vehicle.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Image src={vehicle.image} alt={vehicle.model} width={80} height={60} className="rounded-md" data-ai-hint="car side view"/>
                                            <div>
                                                <div className="font-medium">{vehicle.plate}</div>
                                                <div className="text-sm text-muted-foreground">{vehicle.model} ({vehicle.year})</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getVehicleStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{vehicle.dailyRate}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" title="Editar"><Wrench className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" title="Remover" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Encontrar Motoristas</CardTitle>
                    <CardDescription>Busque em nosso banco de dados por motoristas qualificados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Input placeholder="Buscar por nome..." />
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Avaliação mínima..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 estrelas</SelectItem>
                                <SelectItem value="4.5">4.5 estrelas ou mais</SelectItem>
                                <SelectItem value="4">4 estrelas ou mais</SelectItem>
                            </SelectContent>
                        </Select>
                         <Button className="md:w-fit md:justify-self-end"><Search/> Buscar</Button>
                    </div>
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {drivers.map(driver => (
                            <Card key={driver.id} className="flex flex-col">
                                <CardHeader className="flex flex-row items-center gap-4">
                                     <Avatar>
                                        <AvatarImage src={driver.avatar} alt={driver.name} data-ai-hint="driver portrait"/>
                                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-1"><Star className="text-yellow-500 fill-yellow-400 h-4 w-4"/> {driver.rating} ({driver.completedTrips}+ corridas)</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter>
                                    <Button variant="outline" className="w-full">Ver Perfil Completo</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
