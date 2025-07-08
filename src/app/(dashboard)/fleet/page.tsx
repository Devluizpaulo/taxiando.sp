

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import type { Vehicle, VehicleApplication, UserProfile, AdminUser, Review } from '@/lib/types';
import { vehicleFormSchema, type VehicleFormValues } from '@/lib/fleet-schemas';
import { getFleetData, upsertVehicle, deleteVehicle, updateApplicationStatus, getDriverProfile } from '@/app/actions/fleet-actions';
import { getReviewsForUser } from '@/app/actions/review-actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
import { Car, Users, Eye, PlusCircle, UserCheck, Star, Wrench, Trash2, Loader2, FilePen, ChevronRight, Briefcase, FileText, Smartphone, MessageCircle, StarHalf, Search, GitCommitHorizontal, Fuel } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { vehiclePerks } from '@/lib/data';
import { LoadingScreen } from '@/components/loading-screen';
import { ReviewForm } from '@/components/review-form';
import { StarRating } from '@/components/ui/star-rating';


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
        case 'Aprovado':
        case 'approved':
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


export default function FleetPage() {
    const { user, userProfile, loading: authLoading } = useAuthProtection({ requiredRoles: ['fleet', 'admin'] });
    const { toast } = useToast();
    
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [applications, setApplications] = useState<VehicleApplication[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    // State for driver profile modal
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<AdminUser | null>(null);
    const [driverReviews, setDriverReviews] = useState<Review[]>([]);

    // State for review modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [driverToReview, setDriverToReview] = useState<{id: string, name: string} | null>(null);

    const form = useForm<VehicleFormValues>({
      resolver: zodResolver(vehicleFormSchema),
      defaultValues: { status: 'Disponível', imageUrl: 'https://placehold.co/600x400.png' },
    });
    
    useEffect(() => {
        if (user) {
            const loadData = async () => {
                setPageLoading(true);
                const result = await getFleetData(user.uid);
                if (result.success) {
                    setVehicles(result.vehicles);
                    setApplications(result.applications);
                } else {
                    toast({ variant: 'destructive', title: 'Erro ao Carregar Dados', description: result.error });
                }
                setPageLoading(false);
            };
            loadData();
        }
    }, [user, toast]);
    
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
                condition: 'Semi-novo',
                transmission: 'automatic',
                fuelType: 'flex',
                description: '',
                paymentTerms: '',
                type: 'sedan',
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

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;
        
        const result = await deleteVehicle(vehicleToDelete.id);
        if (result.success) {
            setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
            toast({ title: "Veículo Removido", description: `O veículo ${vehicleToDelete.plate} foi removido da sua frota.`});
        } else {
            toast({ variant: 'destructive', title: "Erro ao Remover", description: result.error});
        }
        
        setIsDeleteDialogOpen(false);
        setVehicleToDelete(null);
    };

    const handleApplicationStatusChange = async (appId: string, newStatus: 'Aprovado' | 'Rejeitado') => {
        const result = await updateApplicationStatus(appId, newStatus);
        if (result.success) {
            setApplications(prev => prev.map(app => 
                app.id === appId ? { ...app, status: newStatus } : app
            ));
            toast({
                title: `Candidatura ${newStatus === 'Aprovado' ? 'Aprovada' : 'Rejeitada'}`,
                description: "O status da candidatura foi atualizado.",
            });
        } else {
            toast({ variant: 'destructive', title: "Erro ao Atualizar", description: result.error});
        }
    };

    const handleViewProfile = async (driverId: string) => {
        setIsFetchingProfile(true);
        setProfileModalOpen(true);
        const [profileData, reviewsData] = await Promise.all([
            getDriverProfile(driverId),
            getReviewsForUser(driverId),
        ]);
        
        if (profileData) {
            setSelectedDriver(profileData);
            setDriverReviews(reviewsData);
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o perfil do motorista.' });
            setProfileModalOpen(false);
        }
        setIsFetchingProfile(false);
    };
    
    const onSubmit = async (values: VehicleFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        
        const result = await upsertVehicle(values, user.uid, selectedVehicle?.id);

        if (result.success) {
            toast({ title: selectedVehicle ? "Veículo Atualizado!" : "Veículo Adicionado!", description: "Os dados do veículo foram salvos." });
            const updatedData = await getFleetData(user.uid);
            if (updatedData.success) {
                setVehicles(updatedData.vehicles);
            }
        } else {
             toast({ variant: 'destructive', title: "Erro ao Salvar", description: result.error});
        }
            
        setIsSubmitting(false);
        setIsVehicleDialogOpen(false);
    };


    if (authLoading || pageLoading) {
        return <LoadingScreen />;
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
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avaliação da Frota</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                             {(userProfile?.averageRating || 0).toFixed(1)}
                            <StarRating rating={userProfile?.averageRating || 0} size={20} readOnly/>
                        </div>
                        <p className="text-xs text-muted-foreground">Baseado em {userProfile?.reviewCount || 0} avaliações</p>
                    </CardContent>
                </Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Visitas ao Perfil (Mês)</CardTitle><Eye className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">1,432</div></CardContent></Card>
            </div>
            
            <Card className="bg-primary/10 border-primary/20">
                <CardHeader>
                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Search className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-primary">Novo! Encontre Motoristas Qualificados</CardTitle>
                            <CardDescription className="mt-2 text-primary/80">
                                Pare de esperar! Busque ativamente por motoristas com o perfil ideal para seus veículos. Filtre por tipo de carro, câmbio e muito mais.
                            </CardDescription>
                        </div>
                        <Button asChild className="w-full md:w-auto">
                            <Link href="/fleet/find-drivers">
                                Buscar Motoristas
                            </Link>
                        </Button>
                    </div>
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
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Veículo</TableHead><TableHead>Status</TableHead><TableHead>Diária</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {vehicles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Nenhum veículo cadastrado. Que tal adicionar o primeiro?</TableCell>
                                    </TableRow>
                                ) : (
                                    vehicles.map(vehicle => (
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
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/fleet/matches/${vehicle.id}`}><Search className="mr-2 h-4 w-4"/>Buscar Matches</Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEditVehicle(vehicle)}><FilePen className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" title="Remover" className="text-destructive hover:text-destructive-foreground focus:text-destructive-foreground" onClick={() => handleDeleteVehicle(vehicle)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Candidaturas Recebidas</CardTitle>
                    <CardDescription>Motoristas que se interessaram pelos seus veículos.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Motorista</TableHead><TableHead>Veículo Aplicado</TableHead><TableHead>Status da Candidatura</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {applications.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma candidatura recebida ainda.</TableCell></TableRow>
                                ) : (
                                    applications.map(app => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={app.driverPhotoUrl} alt={app.driverName} data-ai-hint="driver portrait"/>
                                                        <AvatarFallback>{app.driverName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                                        <span className="font-medium">{app.driverName}</span>
                                                        <Badge variant={getProfileStatusVariant(app.driverProfileStatus)}>
                                                            {app.driverProfileStatus === 'approved' && <UserCheck className="mr-1.5 h-3.5 w-3.5" />}
                                                            Perfil {app.driverProfileStatus === 'approved' ? 'Aprovado' : 'Pendente'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{app.vehicleName}</TableCell>
                                            <TableCell>
                                                 <Badge variant={getProfileStatusVariant(app.status)}>{app.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewProfile(app.driverId)} disabled={isFetchingProfile}>
                                                        {isFetchingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Eye className="mr-2 h-4 w-4"/>}
                                                        Ver Perfil
                                                    </Button>
                                                    {app.status === 'Pendente' ? (
                                                        <>
                                                            <Button variant="outline" size="sm" onClick={() => handleApplicationStatusChange(app.id, 'Aprovado')}>Aprovar</Button>
                                                            <Button variant="destructive" size="sm" onClick={() => handleApplicationStatusChange(app.id, 'Rejeitado')}>Rejeitar</Button>
                                                        </>
                                                    ) : app.status === 'Aprovado' && (
                                                         <Button variant="secondary" size="sm" onClick={() => {
                                                            setDriverToReview({ id: app.driverId, name: app.driverName });
                                                            setIsReviewModalOpen(true);
                                                         }}>
                                                            <StarHalf className="mr-2"/> Avaliar
                                                         </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
                                        <FormField control={form.control} name="type" render={({ field }) => (
                                            <FormItem><FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="hatch">Hatch</SelectItem>
                                                        <SelectItem value="sedan">Sedan</SelectItem>
                                                        <SelectItem value="suv">SUV</SelectItem>
                                                        <SelectItem value="minivan">Minivan</SelectItem>
                                                        <SelectItem value="other">Outro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="condition" render={({ field }) => (
                                            <FormItem><FormLabel>Condição</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Novo">Novo (0km)</SelectItem><SelectItem value="Semi-novo">Semi-novo</SelectItem><SelectItem value="Usado">Usado</SelectItem></SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="transmission" render={({ field }) => (
                                            <FormItem><FormLabel className="flex items-center gap-2"><GitCommitHorizontal/>Câmbio</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="automatic">Automático</SelectItem><SelectItem value="manual">Manual</SelectItem></SelectContent>
                                                </Select>
                                            <FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <FormField control={form.control} name="fuelType" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><Fuel/>Combustível</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                <SelectContent><SelectItem value="flex">Flex</SelectItem><SelectItem value="gnv">GNV</SelectItem><SelectItem value="diesel">Diesel</SelectItem><SelectItem value="electric">Elétrico</SelectItem></SelectContent>
                                            </Select>
                                        <FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição do Anúncio</FormLabel><FormControl><Textarea {...field} placeholder="Descreva os pontos fortes do carro, opcionais, etc." rows={3}/></FormControl><FormMessage /></FormItem>
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
                                                                        ? field.onChange([...(field.value || []), item.id])
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
            <DriverProfileModal user={selectedDriver} reviews={driverReviews} isLoading={isFetchingProfile} isOpen={isProfileModalOpen} onOpenChange={setProfileModalOpen}/>
            
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Avaliar Motorista</DialogTitle>
                        <DialogDescription>Deixe um feedback sobre sua experiência com {driverToReview?.name}.</DialogDescription>
                    </DialogHeader>
                    {userProfile && driverToReview && (
                        <ReviewForm
                            reviewer={userProfile}
                            reviewee={{ id: driverToReview.id, name: driverToReview.name, role: 'driver' }}
                            onReviewSubmitted={() => setIsReviewModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}

// Modal Component to Display Driver Profile
function DriverProfileModal({ user, reviews, isLoading, isOpen, onOpenChange }: { user: AdminUser | null, reviews: Review[], isLoading: boolean, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    }

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Perfil do Candidato</DialogTitle>
                </DialogHeader>
                {isLoading || !user ? (
                    <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="md:col-span-1 flex flex-col items-center text-center gap-4">
                            <Avatar className="h-32 w-32 border-4 border-primary">
                                <AvatarImage src={user.photoUrl} alt={user.name}/>
                                <AvatarFallback className="text-4xl">{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                            <Card className="w-full text-left">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><Smartphone/> Contato</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{user.phone}</p>
                                    {user.hasWhatsApp && <Badge variant="secondary" className="mt-2">Tem WhatsApp</Badge>}
                                </CardContent>
                            </Card>
                             <Card className="w-full text-left">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2"><Star/> Avaliações</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {user.reviewCount && user.reviewCount > 0 ? (
                                         <div className="flex items-center gap-2">
                                            <StarRating rating={user.averageRating || 0} readOnly size={16}/>
                                            <span className="text-sm text-muted-foreground">{(user.averageRating || 0).toFixed(1)} ({user.reviewCount} avaliações)</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            {user.bio && (
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-base">Resumo Profissional</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm text-muted-foreground">{user.bio}</p></CardContent>
                                </Card>
                            )}
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Briefcase/> Documentação</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="font-semibold">Nº CNH</p><p className="text-muted-foreground">{user.cnhNumber || 'Não informado'}</p></div>
                                    <div><p className="font-semibold">Cat. CNH</p><p className="text-muted-foreground">{user.cnhCategory || 'Não informado'}</p></div>
                                    <div><p className="font-semibold">Validade CNH</p><p className="text-muted-foreground">{formatDate(user.cnhExpiration)}</p></div>
                                    <div><p className="font-semibold">Pontos CNH</p><p className="text-muted-foreground">{user.cnhPoints ?? 'Não informado'}</p></div>
                                    <div><p className="font-semibold">Nº Condutax</p><p className="text-muted-foreground">{user.condutaxNumber || 'Não informado'}</p></div>
                                    <div><p className="font-semibold">Validade Condutax</p><p className="text-muted-foreground">{formatDate(user.condutaxExpiration)}</p></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MessageCircle/> Referência Pessoal</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                    <div><p className="font-semibold">Nome</p><p className="text-muted-foreground">{user.reference?.name || 'Não informado'}</p></div>
                                    <div><p className="font-semibold">Relação</p><p className="text-muted-foreground">{user.reference?.relationship || 'Não informado'}</p></div>
                                    <div className="col-span-2"><p className="font-semibold">Telefone</p><p className="text-muted-foreground">{user.reference?.phone || 'Não informado'}</p></div>
                                </CardContent>
                            </Card>
                            {reviews.length > 0 && (
                                <Card>
                                     <CardHeader className="pb-2"><CardTitle className="text-base">Comentários Recebidos</CardTitle></CardHeader>
                                     <CardContent className="space-y-4">
                                        {reviews.map(review => (
                                            <div key={review.id} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">{review.reviewerName}</span>
                                                    <StarRating rating={review.rating} readOnly size={14}/>
                                                </div>
                                                <p className="mt-2 text-muted-foreground italic">"{review.comment}"</p>
                                            </div>
                                        ))}
                                     </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
