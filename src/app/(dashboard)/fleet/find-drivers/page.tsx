
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import type { AdminUser, Review } from '@/lib/types';
import { getDriversSeekingRentals, getDriverProfile } from '@/app/actions/fleet-actions';
import { getReviewsForUser } from '@/app/actions/review-actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { LoadingScreen } from '@/components/loading-screen';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/ui/star-rating';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Eye, Smartphone, MessageCircle, Briefcase, Star, Car, Fuel, GitCommitHorizontal, Users, CreditCard, ShieldCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


function DriverCard({ driver, onViewProfile }: { driver: AdminUser; onViewProfile: (driverId: string) => void; }) {
    const { rentalPreferences: prefs } = driver;
    
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="w-16 h-16 border">
                    <AvatarImage src={driver.photoUrl} alt={driver.name} />
                    <AvatarFallback className="text-xl">{driver.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle>{driver.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={driver.averageRating || 0} size="sm" />
                        <span className="text-xs text-muted-foreground">({driver.reviewCount || 0} avaliações)</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2 text-sm border-t pt-4">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase">Busca por:</h4>
                    {prefs?.vehicleTypes && prefs.vehicleTypes.length > 0 && (
                        <div className="flex items-center gap-2"><Car className="h-4 w-4 text-primary" /> <span>{prefs.vehicleTypes.join(', ')}</span></div>
                    )}
                     {prefs?.transmission && prefs.transmission !== 'indifferent' &&(
                        <div className="flex items-center gap-2"><GitCommitHorizontal className="h-4 w-4 text-primary" /> <span className="capitalize">{prefs.transmission}</span></div>
                    )}
                    {prefs?.fuelTypes && prefs.fuelTypes.length > 0 &&(
                        <div className="flex items-center gap-2"><Fuel className="h-4 w-4 text-primary" /> <span className="capitalize">{prefs.fuelTypes.join(', ')}</span></div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={() => onViewProfile(driver.uid)}><Eye className="mr-2"/>Ver Perfil Completo</Button>
            </CardFooter>
        </Card>
    );
}

function DriverProfileModal({ user, reviews, isLoading, isOpen, onOpenChange }: { user: AdminUser | null, reviews: Review[], isLoading: boolean, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado';
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    }

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Perfil do Motorista</DialogTitle>
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
                                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck/> Segurança</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                                        <span>CPF Verificado:</span>
                                        <Button size="sm" variant="outline" disabled>Consultar (Em Breve)</Button>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                                        <span>Possui Cartão p/ Locação:</span>
                                        <Badge variant={user.hasCreditCardForDeposit ? "default" : "secondary"}>{user.hasCreditCardForDeposit ? "Sim" : "Não"}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
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
                )}
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function FindDriversPage() {
    const { user, userProfile } = useAuthProtection({ requiredRoles: ['fleet', 'admin'] });
    const { toast } = useToast();
    
    const [drivers, setDrivers] = useState<AdminUser[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');

    // Modal state
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<AdminUser | null>(null);
    const [driverReviews, setDriverReviews] = useState<Review[]>([]);
    const [confirmViewProfile, setConfirmViewProfile] = useState<AdminUser | null>(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            const data = await getDriversSeekingRentals();
            setDrivers(data);
            setPageLoading(false);
        };
        fetchDrivers();
    }, []);

    const filteredDrivers = useMemo(() => {
        return drivers.filter(driver => {
            const searchMatch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = vehicleTypeFilter === 'all' || driver.rentalPreferences?.vehicleTypes?.includes(vehicleTypeFilter);
            return searchMatch && typeMatch;
        });
    }, [drivers, searchTerm, vehicleTypeFilter]);
    
    const handleViewProfile = async (driverId: string) => {
        if (!user || !userProfile) return;

        setConfirmViewProfile(null); // Close confirmation dialog
        setIsFetchingProfile(true);
        setProfileModalOpen(true);
        
        try {
            // Deduct credit and fetch profile in a transaction
            const userRef = doc(db, 'users', user.uid);
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw new Error("Usuário não encontrado.");
                
                const currentCredits = userDoc.data().credits || 0;
                if (currentCredits < 1) throw new Error("Créditos insuficientes para ver o perfil.");
                
                transaction.update(userRef, { credits: currentCredits - 1 });
            });
            
            // Fetch profile data after successful transaction
            const [profileData, reviewsData] = await Promise.all([
                getDriverProfile(driverId, user.uid),
                getReviewsForUser(driverId),
            ]);
            
            if (profileData) {
                setSelectedDriver(profileData.profile ?? null);
                setDriverReviews(reviewsData);
            } else {
                throw new Error('Não foi possível carregar o perfil do motorista.');
            }

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: (error as Error).message });
            setProfileModalOpen(false);
        } finally {
            setIsFetchingProfile(false);
        }
    };
    
     const confirmAndHandleView = (driver: AdminUser) => {
        if ((userProfile?.credits ?? 0) < 1) {
            toast({
                variant: 'destructive',
                title: 'Créditos Insuficientes',
                description: 'Você precisa de créditos para ver o perfil completo dos motoristas.',
                action: <Button onClick={() => window.location.href='/billing'}>Comprar Créditos</Button>
            });
            return;
        }
        setConfirmViewProfile(driver);
    };

    if (pageLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Buscar Motoristas</h1>
                <p className="text-muted-foreground">Encontre profissionais qualificados que procuram um veículo como o seu.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Refine sua busca para encontrar o candidato perfeito.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                     <Select value={vehicleTypeFilter} onValueChange={(value: string) => {
                        setVehicleTypeFilter(value);
                    }}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Tipo de Veículo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            <SelectItem value="hatch">Hatch</SelectItem>
                            <SelectItem value="sedan">Sedan</SelectItem>
                            <SelectItem value="suv">SUV</SelectItem>
                            <SelectItem value="minivan">Minivan</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.length > 0 ? (
                    filteredDrivers.map(driver => (
                        <DriverCard key={driver.uid} driver={driver} onViewProfile={() => confirmAndHandleView(driver)} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">Nenhum motorista encontrado</h3>
                        <p>Tente ajustar seus filtros ou verifique novamente mais tarde.</p>
                    </div>
                )}
            </div>
            <DriverProfileModal user={selectedDriver} reviews={driverReviews} isLoading={isFetchingProfile} isOpen={isProfileModalOpen} onOpenChange={setProfileModalOpen} />
            
             <AlertDialog open={!!confirmViewProfile} onOpenChange={(open) => !open && setConfirmViewProfile(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><CreditCard/> Usar 1 Crédito para Contratar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Para ver o perfil completo e os contatos de {confirmViewProfile?.name}, será utilizado 1 crédito do seu saldo. Seu saldo atual é de {userProfile?.credits ?? 0} créditos. Esta ação é o primeiro passo para uma contratação segura. Deseja continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleViewProfile(confirmViewProfile!.uid)}>
                            Sim, usar 1 crédito
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
