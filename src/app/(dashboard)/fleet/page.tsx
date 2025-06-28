
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import type { Vehicle, VehicleApplication } from '@/lib/types';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, Users, Eye, PlusCircle, UserCheck, Star, Wrench, Trash2, Loader2, FilePen, ChevronRight } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { vehiclePerks } from '@/lib/data';


const initialVehicles: Omit<Vehicle, 'id' | 'fleetId' | 'createdAt'>[] = [
  { plate: 'BRA2E19', make: 'Chevrolet', model: 'Onix', year: 2022, status: 'Disponível', dailyRate: 120, imageUrl: 'https://placehold.co/600x400.png', condition: 'Novo', description: 'Carro novo, completo, com ar, direção e som bluetooth.', paymentInfo: { terms: 'Diária (Seg-Sáb)', methods: ['Cartão de Crédito', 'PIX'] }, perks: [{ id: 'full_tank', label: 'Tanque Cheio' }, { id: 'car_wash', label: 'Lava-rápido' }] },
  { plate: 'XYZ1A23', make: 'Hyundai', model: 'HB20', year: 2023, status: 'Alugado', dailyRate: 135, imageUrl: 'https://placehold.co/600x400.png', condition: 'Semi-novo', description: 'Modelo mais recente, super econômico. Ideal para o dia a dia.', paymentInfo: { terms: 'Semanal', methods: ['PIX', 'Boleto'] }, perks: [{ id: 'insurance', label: 'Seguro Passageiro' }] },
  { plate: 'FGH5I67', make: 'Fiat', model: 'Cronos', year: 2021, status: 'Em Manutenção', dailyRate: 110, imageUrl: 'https://placehold.co/600x400.png', condition: 'Usado', description: 'Porta-malas gigante, perfeito para viagens e aeroporto.', paymentInfo: { terms: 'Diária (Seg-Seg)', methods: ['Dinheiro'] }, perks: [] },
];

const initialApplications: VehicleApplication[] = [
    { id: 'app_1', driverId: 'd_1', driverName: 'Carlos Pereira', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', appliedAt: new Date('2024-07-28T10:00:00Z'), status: 'Pendente' },
    { id: 'app_2', driverId: 'd_2', driverName: 'Ana Costa', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Pendente', vehicleId: 'v_1', vehicleName: 'Onix (BRA2E19)', appliedAt: new Date('2024-07-27T15:30:00Z'), status: 'Pendente' },
    { id: 'app_3', driverId: 'd_3', driverName: 'Ricardo Alves', driverPhotoUrl: 'https://placehold.co/40x40.png', driverProfileStatus: 'Aprovado', vehicleId: 'v_4', vehicleName: 'Mobi (FGH5I67)', appliedAt: new Date('2024-07-26T09:00:00Z'), status: 'Aprovado' },
];

const getVehicleStatusVariant = (status: Vehicle['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Disponível': return 'default';
        case 'Alugado': return 'secondary';
        case 'Em Manutenção': return 'destructive';
        default: return 'outline';
    }
};

const getProfileStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Aprovado': return 'default';
        case 'Pendente': return 'secondary';
        case 'Rejeitado': return 'destructive';
        default: return 'outline';
    }
};

const vehicleFormSchema = z.object({
  plate: z.string().min(7, "A placa deve ter 7 caracteres.").max(8, "Formato de placa inválido."),
  make: z.string().min(2, "A marca é obrigatória."),
  model: z.string().min(2, "O modelo é obrigatório."),
  year: z.coerce.number().min(2000, "O ano deve ser superior a 2000.").max(new Date().getFullYear() + 1, "Ano inválido."),
  status: z.enum(['Disponível', 'Alugado', 'Em Manutenção'], { required_error: "O status é obrigatório."}),
  dailyRate: z.coerce.number().min(1, "O valor da diária é obrigatório."),
  imageUrl: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
  condition: z.string().min(1, "A condição é obrigatória."),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres.").max(500, "Limite de 500 caracteres."),
  paymentTerms: z.string().min(3, "As condições são obrigatórias."),
  paymentMethods: z.array(z.string()).optional(),
  perks: z.array(z.string()).optional(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;


export default function FleetPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    // State
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [applications, setApplications] = useState<VehicleApplication[]>(initialApplications);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    const form = useForm<VehicleFormValues>({
      resolver: zodResolver(vehicleFormSchema),
      defaultValues: { status: 'Disponível', imageUrl: 'https://placehold.co/600x400.png' },
    });
    
    useEffect(() => {
        if (!loading && (!userProfile || !['fleet', 'admin'].includes(userProfile.role))) {
            router.push('/dashboard');
        } else {
             const vWithIds = initialVehicles.map((v, i) => ({ ...v, id: `v_${i+1}`, fleetId: 'mockFleetId', createdAt: new Date() }))
             setVehicles(vWithIds);
        }
    }, [userProfile, loading, router]);
    
    useEffect(() => {
        if (isVehicleDialogOpen) {
            form.reset(selectedVehicle ? {
                ...selectedVehicle,
                plate: selectedVehicle.plate.toUpperCase(),
                paymentTerms: selectedVehicle.paymentInfo.terms,
                paymentMethods: selectedVehicle.paymentInfo.methods,
                perks: selectedVehicle.perks.map(p => p.id),
            } : { 
                status: 'Disponível', 
                imageUrl: 'https://placehold.co/600x400.png', 
                year: new Date().getFullYear(),
                perks: [],
                paymentMethods: [],
                plate: '',
                make: '',
                model: '',
                condition: '',
                description: '',
                paymentTerms: '',
            });
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

    const handleApplicationStatusChange = (appId: string, newStatus: 'Aprovado' | 'Rejeitado') => {
        setApplications(prev => prev.map(app => 
            app.id === appId ? { ...app, status: newStatus } : app
        ));
        toast({
            title: `Candidatura ${newStatus === 'Aprovado' ? 'Aprovada' : 'Rejeitada'}`,
            description: "O status da candidatura foi atualizado.",
        });
    };
    
    const onSubmit = async (values: VehicleFormValues) => {
        setIsSubmitting(true);
        // Lógica para salvar no DB viria aqui
        
        const vehicleData = {
            ...values,
            paymentInfo: {
                terms: values.paymentTerms,
                methods: values.paymentMethods || [],
            },
            perks: values.perks?.map(perkId => vehiclePerks.find(p => p.id === perkId)!) || []
        };
        
        // Simulação
        setTimeout(() => {
            if (selectedVehicle) { // Edit
                setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, ...vehicleData, id: v.id, fleetId: v.fleetId, createdAt: v.createdAt } : v));
                toast({ title: "Veículo Atualizado!", description: "Os dados do veículo foram salvos." });
            } else { // Create
                const newVehicle: Vehicle = { 
                    id: `v_${Date.now()}`, 
                    ...vehicleData,
                    fleetId: userProfile!.uid, 
                    createdAt: new Date(),
                };
                setVehicles([newVehicle, ...vehicles]);
                toast({ title: "Veículo Adicionado!", description: `O veículo ${values.plate} foi cadastrado.` });
            }
            
            setIsSubmitting(false);
            setIsVehicleDialogOpen(false);
        }, 1000);
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
                <p className="text-muted-foreground">Gerencie seus veículos, candidaturas e encontre os melhores motoristas.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle><Car className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{vehicles.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Candidaturas</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{applications.length}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avaliação da Frota</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold flex items-center">4.8 <span className="text-xs text-muted-foreground ml-1">/ 5</span></div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Visitas ao Perfil (Mês)</CardTitle><Eye className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">1,432</div></CardContent></Card>
            </div>
            
            <Card className="bg-accent/30 border-accent/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Complete o Perfil da sua Frota</CardTitle>
                        <CardDescription>Um perfil completo atrai mais motoristas. Adicione sua descrição, endereço e redes sociais.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/fleet/profile">
                            Completar Perfil <ChevronRight />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

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
                                            <Image src={vehicle.imageUrl || 'https://placehold.co/120x80.png'} alt={vehicle.model} width={80} height={50} className="rounded-md object-cover aspect-video" data-ai-hint="car side view"/>
                                            <div>
                                                <div className="font-medium">{vehicle.plate}</div>
                                                <div className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant={getVehicleStatusVariant(vehicle.status)}>{vehicle.status}</Badge></TableCell>
                                    <TableCell className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.dailyRate)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEditVehicle(vehicle)}><FilePen className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" title="Remover" className="text-destructive hover:text-destructive-foreground focus:text-destructive-foreground" onClick={() => handleDeleteVehicle(vehicle)}><Trash2 className="h-4 w-4" /></Button>
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
                    <CardTitle>Candidaturas Recebidas</CardTitle>
                    <CardDescription>Motoristas que se interessaram pelos seus veículos.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Motorista</TableHead><TableHead>Veículo Aplicado</TableHead><TableHead>Status do Perfil</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {applications.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={app.driverPhotoUrl} alt={app.driverName} data-ai-hint="driver portrait"/>
                                                <AvatarFallback>{app.driverName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{app.driverName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{app.vehicleName}</TableCell>
                                    <TableCell>
                                        <Badge variant={getProfileStatusVariant(app.driverProfileStatus)}>
                                            {app.driverProfileStatus === 'Aprovado' && <UserCheck className="mr-1.5 h-3.5 w-3.5" />}
                                            {app.driverProfileStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="outline" size="sm">Ver Perfil</Button>
                                            {app.status === 'Pendente' ? (
                                                <>
                                                    <Button variant="outline" size="sm" onClick={() => handleApplicationStatusChange(app.id, 'Aprovado')}>Aprovar</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleApplicationStatusChange(app.id, 'Rejeitado')}>Rejeitar</Button>
                                                </>
                                            ) : (
                                                <Badge variant={app.status === 'Aprovado' ? 'default' : 'destructive'}>{app.status}</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedVehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</DialogTitle>
                        <DialogDescription>{selectedVehicle ? 'Atualize as informações do veículo para seu anúncio.' : 'Preencha os dados do novo veículo para criar um anúncio atraente.'}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <FormField control={form.control} name="plate" render={({ field }) => (
                                        <FormItem><FormLabel>Placa</FormLabel><FormControl><Input {...field} placeholder="BRA2E19" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="make" render={({ field }) => (
                                            <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} placeholder="Ex: Chevrolet" /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="model" render={({ field }) => (
                                            <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} placeholder="Ex: Onix" /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <FormField control={form.control} name="year" render={({ field }) => (
                                            <FormItem><FormLabel>Ano</FormLabel><FormControl><Input type="number" {...field} placeholder="Ex: 2023" /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="condition" render={({ field }) => (
                                            <FormItem><FormLabel>Condição</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Novo">Novo (0km)</SelectItem><SelectItem value="Semi-novo">Semi-novo</SelectItem><SelectItem value="Usado">Usado</SelectItem></SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                     <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição do Anúncio</FormLabel><FormControl><Textarea {...field} placeholder="Descreva os pontos fortes do carro, opcionais, etc." rows={5}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                 <div className="space-y-6">
                                     <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="dailyRate" render={({ field }) => (
                                            <FormItem><FormLabel>Diária (R$)</FormLabel><FormControl><Input type="number" {...field} placeholder="120" /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="status" render={({ field }) => (
                                            <FormItem><FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Disponível">Disponível</SelectItem><SelectItem value="Alugado">Alugado</SelectItem><SelectItem value="Em Manutenção">Em Manutenção</SelectItem></SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                     <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                        <FormItem><FormLabel>URL da Imagem</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    
                                    <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                                        <FormItem><FormLabel>Condições de Pagamento</FormLabel><FormControl><Input {...field} placeholder="Ex: Semanal, Segunda a Sábado" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField
                                        control={form.control}
                                        name="perks"
                                        render={() => (
                                            <FormItem>
                                            <div className="mb-4"><FormLabel>Brindes e Vantagens</FormLabel><FormDescription>Selecione os benefícios inclusos na locação.</FormDescription></div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {vehiclePerks.map((item) => (
                                                    <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="perks"
                                                    render={({ field }) => {
                                                        return (
                                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value || [], item.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                            (value) => value !== item.id
                                                                            )
                                                                        )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                                        </FormItem>
                                                        )
                                                    }}
                                                    />
                                                ))}
                                            </div>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                </div>
                             </div>
                            
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
        </div>
    );
}
