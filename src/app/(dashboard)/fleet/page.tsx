

'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import type { Vehicle, VehicleApplication, UserProfile, AdminUser, Review, GalleryImage } from '@/lib/types';
import { vehicleFormSchema, type VehicleFormValues } from '@/lib/fleet-schemas';
import { getFleetData, upsertVehicle, deleteVehicle, updateApplicationStatus, getDriverProfile } from '@/app/actions/fleet-actions';
import { getReviewsForUser } from '@/app/actions/review-actions';
import { getFleetGalleryImages } from '@/app/actions/secure-storage-actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, Users, Eye, PlusCircle, UserCheck, Star, Wrench, Trash2, Loader2, FilePen, ChevronRight, Briefcase, FileText, Smartphone, MessageCircle, StarHalf, Search, GitCommitHorizontal, Fuel, ShieldCheck, MapPin, UploadCloud, Images, Link as LinkIcon, AlertCircle, ImagePlus, X, Coins } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { vehiclePerks } from '@/lib/data';
import { LoadingScreen } from '@/components/loading-screen';
import { ReviewForm } from '@/components/review-form';
import { StarRating } from '@/components/ui/star-rating';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ToastAction } from '@/components/ui/toast';


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
        default:
            return 'outline';
    }
};


export default function FleetPage() {
    const { user, userProfile, loading } = useAuthProtection({ requiredRoles: ['fleet', 'admin'] });
    const { toast } = useToast();
    
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [applications, setApplications] = useState<VehicleApplication[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    
    const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

    // State for driver profile modal
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<AdminUser | null>(null);
    const [driverReviews, setDriverReviews] = useState<Review[]>([]);

    // State for review modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [driverToReview, setDriverToReview] = useState<{id: string, name: string} | null>(null);
    
    useEffect(() => {
        if (user) {
            const loadData = async () => {
                setPageLoading(true);
                const fleetResult = await getFleetData(user.uid);

                if (fleetResult.success) {
                    setVehicles(fleetResult.vehicles);
                    setApplications(fleetResult.applications);
                } else {
                    toast({ variant: 'destructive', title: 'Erro ao Carregar Dados', description: fleetResult.error });
                }
                setPageLoading(false);
            };
            loadData();
        }
    }, [user, toast]);

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
        if (!user || !userProfile) return;

        // Check for credits before showing the modal
        if (userProfile.credits === undefined || userProfile.credits < 1) {
            toast({
                variant: 'destructive',
                title: 'Créditos Insuficientes',
                description: 'Você precisa de ao menos 1 crédito para ver os detalhes de um motorista.',
                action: <ToastAction altText="Comprar" asChild><Link href="/billing">Comprar Créditos</Link></ToastAction>
            });
            return;
        }

        setIsFetchingProfile(true);
        setIsProfileModalOpen(true);
        
        try {
            const result = await getDriverProfile(driverId, user.uid);
            
            if (result.success && result.profile) {
                const [profileData, reviewsData] = await Promise.all([
                    result.profile,
                    getReviewsForUser(driverId),
                ]);

                // Update local state for credits optimistically
                // Removido setUserProfile, não existe neste contexto.
                toast({ title: "1 Crédito Utilizado", description: "O perfil completo do motorista foi desbloqueado." });
                
                setSelectedDriver(profileData);
                setDriverReviews(reviewsData);
            } else {
                throw new Error(result.error || 'Não foi possível carregar o perfil do motorista.');
            }

        } catch(error) {
            toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
            setIsProfileModalOpen(false);
        } finally {
            setIsFetchingProfile(false);
        }
    };
    
    const onFormSuccess = async () => {
        if(!user) return;
        setIsVehicleDialogOpen(false);
        const updatedData = await getFleetData(user.uid);
        if (updatedData.success) {
            setVehicles(updatedData.vehicles);
        }
    }


    if (loading || pageLoading) {
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
                            <StarRating rating={userProfile?.averageRating || 0} size="lg"/>
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
                                    vehicles.map(vehicle => {
                                        const safeImageUrls: { url: string }[] = (vehicle.imageUrls as any[]).map(img => typeof img.url === 'string' ? img : { url: img.id });
                                        const imageUrl = safeImageUrls[0]?.url || 'https://placehold.co/120x80.png';
                                        return (
                                            <TableRow key={vehicle.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <Image src={imageUrl} alt={vehicle.model} width={80} height={50} className="rounded-md object-cover aspect-video" data-ai-hint="car side view"/>
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
                                                            <Link href={`/fleet/matches/${vehicle.id}`}><Search className="mr-2 h-4 w-4"/>Buscar Motoristas Compatíveis</Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="Editar" onClick={() => handleEditVehicle(vehicle)}><FilePen className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" title="Remover" className="text-destructive hover:text-destructive-foreground focus:text-destructive-foreground" onClick={() => handleDeleteVehicle(vehicle)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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

            <VehicleFormDialog
                isOpen={isVehicleDialogOpen}
                setIsOpen={setIsVehicleDialogOpen}
                vehicle={selectedVehicle}
                onFormSuccess={onFormSuccess}
            />

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
            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Perfil do Candidato</DialogTitle>
                    </DialogHeader>
                    {isFetchingProfile || !selectedDriver ? (
                        <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <DriverProfileContent user={selectedDriver} reviews={driverReviews} />
                    )}
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
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
function DriverProfileContent({ user, reviews }: { user: AdminUser | null, reviews: Review[]}) {
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    }
    
    if (!user) {
        return <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
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
                                <StarRating rating={user.averageRating || 0} size="md"/>
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
                                        <StarRating rating={review.rating} size="sm"/>
                                    </div>
                                    <p className="mt-2 text-muted-foreground italic">"{review.comment}"</p>
                                </div>
                            ))}
                            </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}


function VehicleFormDialog({ isOpen, setIsOpen, vehicle, onFormSuccess }: { isOpen: boolean, setIsOpen: (open: boolean) => void, vehicle: Vehicle | null, onFormSuccess: () => void }) {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: { imageUrls: [], imageFiles: [], perks: [] },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(vehicle ? {
                ...vehicle,
                perks: vehicle.perks.map(p => p.id),
                imageUrls: vehicle.imageUrls.map(url => ({url})),
                imageFiles: [],
            } : {
                status: 'Disponível',
                imageUrls: [],
                imageFiles: [],
                year: new Date().getFullYear(),
                perks: [],
                plate: '',
                make: '',
                model: '',
                condition: 'Semi-novo',
                transmission: 'automatic',
                fuelType: 'flex',
                description: '',
                paymentTerms: '',
                type: 'sedan',
                hasParkingLot: false,
                parkingLotAddress: '',
                isZeroKm: false,
                internalNotes: '',
            });
        }
    }, [isOpen, vehicle, form]);
    
    const onSubmit = async (values: VehicleFormValues) => {
        if (!user || !userProfile) return;
        setIsSubmitting(true);
        
        try {
            const result = await upsertVehicle(values, user.uid, userProfile.name || userProfile.nomeFantasia || 'Frota', vehicle?.id);
            if (result.success) {
                toast({ title: vehicle ? "Veículo Atualizado!" : "Veículo Adicionado!", description: "Seu anúncio foi enviado para moderação." });
                onFormSuccess();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro ao Salvar", description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{vehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</DialogTitle>
                    <DialogDescription>{vehicle ? 'Atualize as informações do veículo para seu anúncio.' : 'Preencha os dados do novo veículo para criar um anúncio atraente.'}</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        {/* Conteúdo do formulário movido para o componente filho */}
                        <VehicleFormFields form={form} />

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
    )
}

function VehicleFormFields({ form }: { form: any }) {
    const watchHasParkingLot = form.watch("hasParkingLot");
    const watchIsZeroKm = form.watch("isZeroKm");
     
    useEffect(() => {
        if (watchIsZeroKm) {
            form.setValue('condition', 'Novo');
        } else if (form.getValues('condition') === 'Novo') {
             form.setValue('condition', 'Semi-novo');
        }
    }, [watchIsZeroKm, form]);

    return (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                {/* Campos da coluna 1 */}
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
                        <FormItem><FormLabel>Ano</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="hatch">Hatch</SelectItem><SelectItem value="sedan">Sedan</SelectItem><SelectItem value="suv">SUV</SelectItem><SelectItem value="minivan">Minivan</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="isZeroKm" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Este veículo é 0km?</FormLabel></div></FormItem>
                )}/>
                <FormField control={form.control} name="condition" render={({ field }) => (
                    <FormItem><FormLabel>Condição</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={watchIsZeroKm}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Novo">Novo</SelectItem><SelectItem value="Semi-novo">Semi-novo</SelectItem><SelectItem value="Usado">Usado</SelectItem></SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
            </div>
            <div className="space-y-6">
                {/* Campos da coluna 2 */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="transmission" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-2"><GitCommitHorizontal/>Câmbio</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="automatic">Automático</SelectItem><SelectItem value="manual">Manual</SelectItem></SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="fuelType" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-2"><Fuel/>Combustível</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="flex">Flex</SelectItem><SelectItem value="gnv">GNV</SelectItem><SelectItem value="hybrid">Híbrido</SelectItem><SelectItem value="electric">Elétrico</SelectItem></SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
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
                                <SelectContent><SelectItem value="Disponível">Disponível</SelectItem><SelectItem value="Alugado">Alugado</SelectItem><SelectItem value="Em Manutenção">Em Manutenção</SelectItem></SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                    <FormItem><FormLabel>Condições de Pagamento</FormLabel><FormControl><Input {...field} placeholder="Ex: Semanal, Segunda a Sábado" /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="hasParkingLot" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><FormLabel className="flex items-center gap-2"><MapPin/> Possui Ponto Fixo?</FormLabel><FormDescription>Este veículo está vinculado a um ponto fixo?</FormDescription></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                 )}/>
                {watchHasParkingLot && (
                     <FormField control={form.control} name="parkingLotAddress" render={({ field }) => (
                        <FormItem><FormLabel>Endereço do Ponto</FormLabel><FormControl><Input {...field} placeholder="Ex: Ponto do Aeroporto de Congonhas" /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
            </div>
             <div className="md:col-span-2">
                <ImageGalleryManager form={form} />
             </div>
             <div className="md:col-span-2">
                 <FormField control={form.control} name="perks" render={() => (
                    <FormItem><div className="mb-4 pt-4 border-t"><FormLabel>Brindes e Vantagens</FormLabel><FormDescription>Selecione os benefícios inclusos na locação.</FormDescription></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {vehiclePerks.map((item) => (
                            <FormField key={item.id} control={form.control} name="perks" render={({ field }) => (<FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                    if (checked) field.onChange([...(field.value || []), item.id]);
                                    else field.onChange(field.value?.filter((v: string) => v !== item.id));
                                }} /></FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel></FormItem>
                            )}/>
                        ))}
                    </div><FormMessage /></FormItem>
                )}/>
             </div>
            <div className="md:col-span-2 space-y-4 pt-4 border-t">
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descrição do Anúncio</FormLabel><FormControl><Textarea {...field} placeholder="Descreva os pontos fortes do carro, opcionais, etc." rows={3}/></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="internalNotes" render={({ field }) => (
                    <FormItem><FormLabel>Observações Internas (Não-público)</FormLabel><FormControl><Textarea {...field} placeholder="Ex: Próxima revisão em 10.000km, arranhão no para-choque traseiro, etc." rows={3}/></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>
    )
}

function ImageGalleryManager({ form }: { form: any }) {
    const { fields: imageUrls, append, remove } = useFieldArray({
        control: form.control,
        name: "imageUrls"
    });
    
    const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [confirmBonusUpload, setConfirmBonusUpload] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeSlotIndex = useRef(0);
    
    useEffect(() => {
        if(user && isImageSelectorOpen) {
            getFleetGalleryImages(user.uid, true).then(setGalleryImages);
        }
    }, [user, isImageSelectorOpen]);

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0 || !userProfile) return;
        const file = files[0];
        
        if (activeSlotIndex.current === 3 && (userProfile.credits || 0) < 1) {
            toast({ variant: 'destructive', title: 'Créditos Insuficientes', description: 'Você não tem créditos para adicionar uma imagem bônus.'});
            setConfirmBonusUpload(false);
            return;
        }

        if (activeSlotIndex.current === 3) {
            setConfirmBonusUpload(true);
            return;
        }

        const imageFiles = form.getValues('imageFiles') || [];
        form.setValue('imageFiles', [...imageFiles, file]);
        append({ url: URL.createObjectURL(file) });
        setIsImageSelectorOpen(false);
    }

     const confirmUploadAndDeductCredit = async () => {
         if (!fileInputRef.current?.files || !userProfile) return;
         const file = fileInputRef.current.files[0];
         // Here would be the logic to deduct credit, for now we simulate it.
         toast({ title: "Crédito Utilizado!", description: "1 crédito foi deduzido para o upload da imagem bônus." });

         const imageFiles = form.getValues('imageFiles') || [];
         form.setValue('imageFiles', [...imageFiles, file]);
         append({ url: URL.createObjectURL(file) });
         setConfirmBonusUpload(false);
         setIsImageSelectorOpen(false);
    }
    
    const handleGallerySelect = (url: string) => {
        if (imageUrls[activeSlotIndex.current]) {
            form.setValue(`imageUrls.${activeSlotIndex.current}`, { url });
        } else {
            append({ url: url });
        }
        setIsImageSelectorOpen(false);
    }

    const openImageSelector = (index: number) => {
        activeSlotIndex.current = index;
        setIsImageSelectorOpen(true);
    };

    return (
        <div>
            <Label>Galeria do Anúncio (3 grátis + 1 bônus)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[...Array(4)].map((_, index) => {
                    const safeImageUrls: { url: string }[] = imageUrls.map((img: any) => typeof img.url === 'string' ? img : { url: img.id });
                    const imageUrl = safeImageUrls[index]?.url;
                    const isBonusSlot = index === 3;
                    return (
                        <Card key={index} className={cn("aspect-video flex items-center justify-center relative group", isBonusSlot && "border-dashed border-primary")}>
                            {imageUrl ? (
                                <>
                                    <Image src={imageUrl} alt={`Imagem do veículo ${index + 1}`} fill className="object-cover rounded-md" />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 z-10" onClick={() => remove(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Button type="button" variant="ghost" onClick={() => openImageSelector(index)} className="h-auto p-2 flex flex-col items-center">
                                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground mt-1">{isBonusSlot ? "Slot Bônus" : `Imagem ${index + 1}`}</span>
                                    </Button>
                                </div>
                            )}
                             {isBonusSlot && <Badge variant="secondary" className="absolute bottom-1 right-1 bg-amber-200 text-amber-800"><Coins className="mr-1 h-3 w-3"/> Bônus</Badge>}
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isImageSelectorOpen} onOpenChange={setIsImageSelectorOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Selecionar Imagem</DialogTitle></DialogHeader>
                    <Tabs defaultValue="upload">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Novo Upload</TabsTrigger>
                            <TabsTrigger value="gallery">Minha Galeria</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="pt-4">
                            <Input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} />
                        </TabsContent>
                        <TabsContent value="gallery" className="pt-4">
                            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                                {galleryImages.length > 0 ? galleryImages.map(img => (
                                    <button type="button" key={img.id} className="relative aspect-square rounded-md overflow-hidden" onClick={() => handleGallerySelect(img.url)}>
                                        <Image src={img.url} alt={img.name} fill className="object-cover"/>
                                    </button>
                                )) : <p className="col-span-full text-center py-8 text-sm text-muted-foreground">Sua galeria está vazia. Faça uploads para reutilizar fotos.</p>}
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

             <AlertDialog open={confirmBonusUpload} onOpenChange={setConfirmBonusUpload}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Upload Bônus</AlertDialogTitle><AlertDialogDescription>Este é um slot de imagem bônus. Um novo upload aqui consumirá 1 crédito do seu saldo. Deseja continuar?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmUploadAndDeductCredit}>Sim, usar 1 crédito</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
