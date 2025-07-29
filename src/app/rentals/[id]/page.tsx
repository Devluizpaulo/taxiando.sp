

'use client'

import React, { use } from 'react';
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


export default function RentalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [fleet, setFleet] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [mainImage, setMainImage] = useState<string | null>(null);

    const { id } = use(params);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const result = await getVehicleDetails(id);
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
    }, [id, router, toast]);


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
        const result = await createApplication(id, user.uid);
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
                                            <Image src={url} alt={`${vehicle.make} ${vehicle.model} ${index + 1}`} width={100} height={75} className="w-full h-full object-cover"/>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">Detalhes do Veículo</CardTitle>
                                    <CardDescription>Informações completas sobre o veículo disponível para locação.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Marca:</p>
                                            <p className="text-lg font-semibold">{vehicle.make}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Modelo:</p>
                                            <p className="text-lg font-semibold">{vehicle.model}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Ano:</p>
                                            <p className="text-lg font-semibold">{vehicle.year}</p>
                                        </div>
                                        {/* <div>
                                            <p className="text-sm font-medium text-muted-foreground">Cor:</p>
                                            <p className="text-lg font-semibold">{vehicle.colorName}</p>
                                        </div> */}
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Combustível:</p>
                                            <p className="text-lg font-semibold">{vehicle.fuelType}</p>
                                        </div>
                                        {/* <div>
                                            <p className="text-sm font-medium text-muted-foreground">Quilometragem:</p>
                                            <p className="text-lg font-semibold">{vehicle.km} km</p>
                                        </div> */}
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Preço por Dia:</p>
                                            <p className="text-lg font-semibold">R$ {vehicle.dailyRate.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Status:</p>
                                            <p className="text-lg font-semibold">{vehicle.status}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">Perks e Benefícios</CardTitle>
                                    <CardDescription>O que você receberá ao alugar este veículo.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {allVehiclePerks.map((perk) => (
                                            <Badge key={perk.id} variant="secondary" className="flex items-center gap-2">
                                                <perk.icon className="h-4 w-4" />
                                                {perk.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">Informações da Frota</CardTitle>
                                    <CardDescription>Detalhes sobre a frota e a empresa.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Empresa:</p>
                                            <p className="text-lg font-semibold">{fleet.nomeFantasia || fleet.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">CNPJ:</p>
                                            <p className="text-lg font-semibold">{fleet.cnpj}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Endereço:</p>
                                            <p className="text-lg font-semibold">{fleet.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Telefone:</p>
                                            <p className="text-lg font-semibold">{fleet.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Email:</p>
                                            <p className="text-lg font-semibold">{fleet.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold">Amenidades da Frota</CardTitle>
                                    <CardDescription>O que a frota oferece para você.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {fleetAmenities.map((amenity) => (
                                            <Badge key={amenity.id} variant="secondary" className="flex items-center gap-2">
                                                <amenity.icon className="h-4 w-4" />
                                                {amenity.label}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="flex justify-end">
                            <Button onClick={handleApply} className="text-lg" disabled={isApplying}>
                                {isApplying ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                )}
                                {isApplying ? "Aplicando..." : "Se Candidatar"}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">Informações de Contato</CardTitle>
                                <CardDescription>Como você pode entrar em contato com a frota.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-lg font-semibold">{fleet.address}</p>
                                        <p className="text-sm text-muted-foreground">{fleet.phone}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <FacebookIcon className="h-6 w-6 text-primary" />
                                    <p className="text-sm text-muted-foreground">Conecte-se com a frota no Facebook</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">Sobre a Frota</CardTitle>
                                <CardDescription>Uma breve descrição sobre a frota.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg">{fleet.companyDescription}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}