

'use client'

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '@/hooks/use-auth';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Instagram, MessageSquare, Car, Building, Sparkles, User, ShieldCheck, Fuel, Calendar, Wrench, CreditCard, Loader2, Phone, MapPin } from "lucide-react";
import { vehiclePerks as allVehiclePerks, fleetAmenities } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { ToastAction } from '@/components/ui/toast';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { LoadingScreen } from '@/components/loading-screen';
import { getVehicleDetails, createApplication } from '@/app/actions/fleet-actions';
import { type Vehicle, type UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';


export default function RentalDetailsPage({ params }: { params: { id: string } }) {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [fleet, setFleet] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [mainImage, setMainImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const result = await getVehicleDetails(params.id);
            if (result.success && result.vehicle && result.fleet) {
                setVehicle(result.vehicle);
                setFleet(result.fleet);
                if (result.vehicle.imageUrls && result.vehicle.imageUrls.length > 0) {
                    setMainImage(result.vehicle.imageUrls[0]);
                }
            } else {
                toast({ variant: "destructive", title: "Erro", description: result.error || "Não foi possível carregar os detalhes do veículo." });
                router.push('/rentals');
            }
            setLoading(false);
        };
        fetchDetails();
    }, [params.id, router, toast]);


    const handleApply = async () => {
        if (!user || !userProfile) {
            toast({ variant: "destructive", title: "Acesso Negado", description: "Você precisa estar logado para se candidatar." });
            return;
        }
        
        if (userProfile.profileStatus !== 'approved') {
            toast({
                variant: "destructive",
                title: "Perfil Incompleto ou Não Aprovado",
                description: "Seu perfil precisa estar completo e aprovado por nossa equipe antes de você poder se candidatar.",
                action: (
                    <ToastAction altText="Completar Perfil" asChild>
                        <Button onClick={() => router.push('/profile')}>Completar Perfil</Button>
                    </ToastAction>
                ),
                duration: 8000,
            });
            return;
        }
        
        setIsApplying(true);
        const result = await createApplication(params.id, user.uid);
        if (result.success) {
            toast({ title: "Candidatura Enviada!", description: `Sua aplicação para o ${vehicle?.make} ${vehicle?.model} foi enviada para a ${fleet?.nomeFantasia || fleet?.name}.` });
        } else {
            toast({ variant: "destructive", title: "Erro na Candidatura", description: result.error || "Não foi possível enviar sua candidatura." });
        }
        setIsApplying(false);
    }

    if (loading || authLoading) {
        return <LoadingScreen />;
    }
    
    if (!vehicle || !fleet) {
         return <LoadingScreen />; // or an error component
    }

    return (
        <div className="bg-muted/40">
            <div className="container mx-auto py-12 px-4 md:px-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <Link href="/rentals" className="text-sm text-primary hover:underline mb-2 inline-block">
                                &larr; Voltar para todos os veículos
                            </Link>
                            <h1 className="font-headline text-4xl font-bold tracking-tight">{vehicle.make} {vehicle.model} <span className="text-muted-foreground font-normal">({vehicle.year})</span></h1>
                        </div>
                        
                        <div className="space-y-4">
                            <Image src={mainImage || 'https://placehold.co/800x600.png'} alt={`${vehicle.make} ${vehicle.model}`} width={800} height={600} className="w-full rounded-xl object-cover aspect-video" data-ai-hint="car front view"/>
                            {vehicle.imageUrls.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {vehicle.imageUrls.map((url, index) => (
                                        <button key={index} onClick={() => setMainImage(url)} className={cn("relative aspect-video rounded-md overflow-hidden transition-opacity hover:opacity-80 focus:ring-2 focus:ring-ring ring-offset-2", mainImage === url && "ring-2 ring-ring")}>
                                            <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Card>
                            <CardHeader><CardTitle>Descrição do Veículo</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">{vehicle.description}</p></CardContent>
                        </Card>
                        
                        {vehicle.hasParkingLot && vehicle.parkingLotAddress && (
                             <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin/> Ponto Fixo Vinculado</CardTitle></CardHeader>
                                <CardContent><p className="text-muted-foreground">Este veículo possui um ponto de estacionamento fixo no endereço: <strong>{vehicle.parkingLotAddress}</strong>. Uma grande vantagem para sua operação diária.</p></CardContent>
                            </Card>
                        )}


                        <Card>
                            <CardHeader><CardTitle>Vantagens e Benefícios Inclusos</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vehicle.perks.map(perk => {
                                    const PerkIcon = allVehiclePerks.find(p => p.id === perk.id)?.icon || Car;
                                    return (
                                        <div key={perk.id} className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><PerkIcon /></div>
                                            <span className="font-medium">{perk.label}</span>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Condições de Pagamento</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold">Termos de Locação</h4>
                                    <p className="text-muted-foreground">{vehicle.paymentInfo.terms}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Meios de Pagamento Aceitos</h4>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                    {vehicle.paymentInfo.methods.map(method => <Badge key={method} variant="secondary">{method}</Badge>)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-6">
                            <Card>
                                <CardHeader className="text-center pb-4">
                                    <p className="text-sm text-muted-foreground">Diária</p>
                                    <p className="text-5xl font-bold font-headline text-primary">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(vehicle.dailyRate)}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleApply} disabled={isApplying}>
                                        {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Quero Alugar este Carro'}
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center gap-4">
                                     <Link href={`/fleets/${fleet.uid}`}>
                                        <Image src={fleet.photoUrl || "https://placehold.co/80x80.png"} alt={fleet.nomeFantasia || fleet.name || ''} width={64} height={64} className="rounded-lg bg-muted" data-ai-hint="company logo"/>
                                    </Link>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Oferecido por</p>
                                        <Link href={`/fleets/${fleet.uid}`} className="hover:underline">
                                            <CardTitle className="text-xl">{fleet.nomeFantasia || fleet.name}</CardTitle>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground border-t pt-4">{fleet.companyDescription}</p>
                                    
                                    {fleet.amenities && fleet.amenities.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Comodidades da Frota</h4>
                                            <ul className="space-y-2">
                                            {fleet.amenities.map(amenity => {
                                                const AmenityIcon = fleetAmenities.find(a => a.id === amenity.id)?.icon || Sparkles;
                                                return (
                                                    <li key={amenity.id} className="flex items-center gap-2 text-sm">
                                                        <AmenityIcon className="h-4 w-4 text-green-600" />
                                                        <span className="text-muted-foreground">{amenity.label}</span>
                                                    </li>
                                                )
                                            })}
                                            </ul>
                                        </div>
                                    )}

                                {fleet.socialMedia && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-2 text-card-foreground">Redes Sociais e Contato</h4>
                                            <div className="flex gap-3">
                                                {fleet.socialMedia.instagram && <Button asChild variant="outline" size="icon"><Link href={`https://instagram.com/${fleet.socialMedia.instagram.replace('@','')}`} target="_blank"><Instagram /></Link></Button>}
                                                {fleet.socialMedia.facebook && <Button asChild variant="outline" size="icon"><Link href={`https://facebook.com${fleet.socialMedia.facebook}`} target="_blank"><FacebookIcon /></Link></Button>}
                                                {fleet.socialMedia.whatsapp && <Button asChild variant="outline" size="icon"><Link href={`https://wa.me/${fleet.socialMedia.whatsapp}`} target="_blank"><MessageSquare /></Link></Button>}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
