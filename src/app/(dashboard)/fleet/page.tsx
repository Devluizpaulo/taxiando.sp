
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import type { Vehicle } from '@/lib/types';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, Users, Eye, PlusCircle, Search, Star, Wrench, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';


const initialVehicles: Omit<Vehicle, 'id' | 'fleetId' | 'createdAt'>[] = [
  { plate: 'BRA2E19', model: 'Chevrolet Onix', year: 2022, status: 'Disponível', dailyRate: 120, imageUrl: 'https://placehold.co/120x80.png' },
  { plate: 'RJZ1I55', model: 'Hyundai HB20', year: 2023, status: 'Alugado', dailyRate: 135, imageUrl: 'https://placehold.co/120x80.png' },
  { plate: 'FKT8J21', model: 'Fiat Cronos', year: 2021, status: 'Em Manutenção', dailyRate: 110, imageUrl: 'https://placehold.co/120x80.png' },
];

const drivers = [
    { id: 'd_1', name: 'Carlos Pereira', rating: 4.9, completedTrips: 1500, avatar: 'https://placehold.co/40x40.png' },
    { id: 'd_2', name: 'Ana Costa', rating: 4.8, completedTrips: 950, avatar: 'https://placehold.co/40x40.png' },
    { id: 'd_3', name: 'Ricardo Alves', rating: 4.9, completedTrips: 2100, avatar: 'https://placehold.co/40x40.png' },
];

const getVehicleStatusVariant = (status: Vehicle['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Disponível': return 'default';
        case 'Alugado': return 'secondary';
        case 'Em Manutenção': return 'destructive';
        default: return 'outline';
    }
};

const vehicleFormSchema = z.object({
  plate: z.string().min(7, "A placa deve ter 7 caracteres.").max(8, "Formato de placa inválido."),
  model: z.string().min(3, "O modelo é obrigatório."),
  year: z.coerce.number().min(2000, "O ano deve ser superior a 2000.").max(new Date().getFullYear() + 1, "Ano inválido."),
  status: z.enum(['Disponível', 'Alugado', 'Em Manutenção'], { required_error: "O status é obrigatório."}),
  dailyRate: z.coerce.number().min(1, "O valor da diária é obrigatório."),
  imageUrl: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;


export default function FleetPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    // State
    const [vehicles, setVehicles] = useState<Vehicle[]>(() => 
      initialVehicles.map((v, i) => ({ ...v, id: `v_${i+1}`, fleetId: 'mockFleetId', createdAt: new Date() }))
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    const form = useForm<VehicleFormValues>({
      resolver: zodResolver(vehicleFormSchema),
      defaultValues: { status: 'Disponível', imageUrl: 'https://placehold.co/120x80.png' },
    });
    
    useEffect(() => {
        if (!loading && (!userProfile || !['fleet', 'admin'].includes(userProfile.role))) {
            router.push('/dashboard');
        }
    }, [userProfile, loading, router]);
    
    useEffect(() => {
        if (isVehicleDialogOpen) {
            form.reset(selectedVehicle ? {
                ...selectedVehicle,
                plate: selectedVehicle.plate.toUpperCase()
            } : { status: 'Disponível', imageUrl: 'https://placehold.co/120x80.png', year: new Date().getFullYear() });
        }
    }, [isVehicleDialogOpen, selectedVehicle, form]);


    const handleAddNewVehicle = () => {
        setSelectedVehicle(null);
        setIsVehicleDialogOpen(true);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsVehicleDialogOpen(true);
    };

    const handleDeleteVehicle = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!vehicleToDelete) return;
        // Lógica para deletar do DB viria aqui
        setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
        toast({ title: "Veículo Removido", description: `O veículo ${vehicleToDelete.plate} foi removido da sua frota.`});
        setIsDeleteDialogOpen(false);
        setVehicleToDelete(null);
    };
    
    const onSubmit = async (values: VehicleFormValues) => {
        setIsSubmitting(true);
        // Lógica para salvar no DB viria aqui
        
        if (selectedVehicle) { // Edit
            setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, ...values } : v));
            toast({ title: "Veículo Atualizado!", description: "Os dados do veículo foram salvos." });
        } else { // Create
            const newVehicle: Vehicle = { 
                id: `v_${Date.now()}`, 
                ...values,
                fleetId: userProfile!.uid, 
                createdAt: new Date(),
            };
            setVehicles([newVehicle, ...vehicles]);
            toast({ title: "Veículo Adicionado!", description: `O veículo ${values.plate} foi cadastrado.` });
        }
        
        setIsSubmitting(false);
        setIsVehicleDialogOpen(false);
    };


    if (loading || !userProfile || !['fleet', 'admin'].includes(userProfile.role)) {
        return (
            <div className="flex flex-col gap-8">
                <Skeleton className="h-10 w-1/2" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
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
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle><Car className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{vehicles.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Motoristas Compatíveis</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">250+</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avaliação da Frota</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold flex items-center">4.8 <span className="text-xs text-muted-foreground ml-1">/ 5</span></div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Visitas ao Perfil (Mês)</CardTitle><Eye className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">1,432</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Meus Veículos</CardTitle>
                        <CardDescription>Visualize e gerencie todos os veículos da sua frota.</CardDescription>
                    </div>
                    <Button onClick={handleAddNewVehicle}><PlusCircle /> Cadastrar Novo Veículo</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Veículo</TableHead><TableHead>Status</TableHead><TableHead>Diária</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {vehicles.map(vehicle => (
                                <TableRow key={vehicle.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Image src={vehicle.imageUrl || 'https://placehold.co/120x80.png'} alt={vehicle.model} width={80} height={60} className="rounded-md object-cover" data-ai-hint="car side view"/>
                                            <div>
                                                <div className="font-medium">{vehicle.plate}</div>
                                                <div className="text-sm text-muted-foreground">{vehicle.model} ({vehicle.year})</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant={getVehicleStatusVariant(vehicle.status)}>{vehicle.status}</Badge></TableCell>
                                    <TableCell className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.dailyRate)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEditVehicle(vehicle)}><Wrench className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" title="Remover" className="text-destructive hover:text-destructive-foreground focus:text-destructive-foreground" onClick={() => handleDeleteVehicle(vehicle)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</DialogTitle>
                        <DialogDescription>{selectedVehicle ? 'Atualize as informações do veículo.' : 'Preencha os dados do novo veículo da frota.'}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="plate" render={({ field }) => (
                                <FormItem><FormLabel>Placa</FormLabel><FormControl><Input {...field} placeholder="ABC-1234" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="model" render={({ field }) => (
                                    <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} placeholder="Ex: Onix" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="year" render={({ field }) => (
                                    <FormItem><FormLabel>Ano</FormLabel><FormControl><Input type="number" {...field} placeholder="Ex: 2023" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="dailyRate" render={({ field }) => (
                                    <FormItem><FormLabel>Diária (R$)</FormLabel><FormControl><Input type="number" {...field} placeholder="120" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Disponível">Disponível</SelectItem>
                                                <SelectItem value="Alugado">Alugado</SelectItem>
                                                <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                             <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem><FormLabel>URL da Imagem</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar Veículo
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso removerá permanentemente o veículo <span className="font-bold">{vehicleToDelete?.plate}</span> da sua frota.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setVehicleToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Confirmar Remoção</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


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
                                        <CardDescription className="flex items-center gap-1"><Star className="text-yellow-500 fill-current h-4 w-4"/> {driver.rating} ({driver.completedTrips}+ corridas)</CardDescription>
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

    