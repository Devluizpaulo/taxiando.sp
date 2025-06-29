
'use client'

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '@/hooks/use-auth';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Instagram, MessageSquare, Car, MapPin, Building, Sparkles, User, ShieldCheck, Fuel, Calendar, Wrench, CreditCard } from "lucide-react";
import { vehiclePerks, fleetAmenities } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { ToastAction } from '@/components/ui/toast';
import { FacebookIcon } from '@/components/icons/facebook-icon';

const vehicle = { 
    id: 'v_1',
    make: 'Chevrolet', 
    model: 'Onix', 
    year: 2022, 
    status: 'Disponível', 
    dailyRate: 120, 
    imageUrl: 'https://placehold.co/800x600.png', 
    condition: 'Novo', 
    description: 'Carro novo, completo, com ar condicionado, direção elétrica e som bluetooth. Perfeito para o dia a dia na cidade, muito econômico e confortável para os passageiros. Todas as revisões estão em dia.', 
    paymentInfo: { terms: 'Pagamento semanal, caução de R$800', methods: ['Cartão de Crédito', 'PIX', 'Boleto'] }, 
    perks: [
        { id: 'full_tank', label: 'Tanque Cheio' }, 
        { id: 'car_wash', label: 'Lava-rápido incluso' }, 
        { id: 'insurance', label: 'Seguro Passageiro' },
        { id: 'gvn', label: 'Kit GNV 5ª Geração' },
        { id: 'support', label: 'Suporte 24h' }
    ]
};

const fleet = {
    name: "Frota Rápida SP",
    logoUrl: "https://placehold.co/80x80.png",
    companyDescription: "Somos uma frota com mais de 10 anos de experiência no mercado de táxis de São Paulo. Nosso foco é oferecer veículos de qualidade com manutenção impecável para garantir a segurança e o conforto dos nossos motoristas parceiros. Oferecemos um ambiente amigável e suporte completo.",
    address: "Rua das Laranjeiras, 123 - Vila Mariana, São Paulo - SP",
    socialMedia: { instagram: '@frotarapidasp', facebook: '/frotarapidasp', whatsapp: '5511999998888'},
    amenities: [
        { id: 'coffee', label: 'Espaço para café' },
        { id: 'wifi', label: 'Wi-Fi para motoristas' },
        { id: 'tow_truck', label: 'Guincho 24 horas' }
    ]
}

export default function RentalDetailsPage({ params }: { params: { id: string } }) {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false); 

    const handleApply = () => {
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

        toast({ title: "Candidatura Enviada!", description: `Sua aplicação para o ${vehicle.make} ${vehicle.model} foi enviada para a ${fleet.name}.` });
    }

    if (loading) {
        return (
             <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6"><Skeleton className="h-96 w-full rounded-lg" /><Skeleton className="h-64 w-full" /></div>
                <div className="lg:col-span-1"><Card><CardHeader><Skeleton className="h-80 w-full" /></CardHeader></Card></div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                 <div>
                    <Link href="/rentals" className="text-sm text-primary hover:underline mb-2 inline-block">
                        &larr; Voltar para todos os veículos
                    </Link>
                    <h1 className="font-headline text-4xl font-bold tracking-tight">{vehicle.make} {vehicle.model} <span className="text-muted-foreground font-normal">({vehicle.year})</span></h1>
                 </div>
                
                 <Image src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} width={800} height={600} className="w-full rounded-xl object-cover aspect-video" data-ai-hint="car front view"/>

                <Card>
                    <CardHeader><CardTitle>Descrição do Veículo</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">{vehicle.description}</p></CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Vantagens e Benefícios Inclusos</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicle.perks.map(perk => {
                            const PerkIcon = vehiclePerks.find(p => p.id === perk.id)?.icon || Car;
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
                            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleApply}>Quero Alugar este Carro</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Image src={fleet.logoUrl} alt={fleet.name} width={64} height={64} className="rounded-lg" data-ai-hint="company logo"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Oferecido por</p>
                                <CardTitle className="text-xl">{fleet.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground border-t pt-4">{fleet.companyDescription}</p>
                            
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

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Redes Sociais e Contato</h4>
                                <div className="flex gap-3">
                                    {fleet.socialMedia.instagram && <Button asChild variant="outline" size="icon"><Link href={`https://instagram.com/${fleet.socialMedia.instagram.replace('@','')}`} target="_blank"><Instagram /></Link></Button>}
                                    {fleet.socialMedia.facebook && <Button asChild variant="outline" size="icon"><Link href={`https://facebook.com${fleet.socialMedia.facebook}`} target="_blank"><FacebookIcon /></Link></Button>}
                                    {fleet.socialMedia.whatsapp && <Button asChild variant="outline" size="icon"><Link href={`https://wa.me/${fleet.socialMedia.whatsapp}`} target="_blank"><MessageSquare /></Link></Button>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
