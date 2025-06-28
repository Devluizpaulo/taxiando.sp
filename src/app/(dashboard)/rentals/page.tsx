
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Vehicle } from '@/lib/types';
import { vehiclePerks as allPerks } from '@/lib/data';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Car, Fuel, MapPin, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialVehicles: Omit<Vehicle, 'id' | 'fleetId' | 'createdAt'>[] = [
  { make: 'Chevrolet', model: 'Onix', year: 2022, status: 'Disponível', dailyRate: 120, imageUrl: 'https://placehold.co/600x400.png', condition: 'Novo', description: 'Carro novo, completo, com ar, direção e som bluetooth.', paymentInfo: { terms: 'Diária (Seg-Sáb)', methods: ['Cartão de Crédito', 'PIX'] }, perks: [{ id: 'full_tank', label: 'Tanque Cheio' }, { id: 'car_wash', label: 'Lava-rápido' }, { id: 'insurance', label: 'Seguro Passageiro' }] },
  { make: 'Hyundai', model: 'HB20', year: 2023, status: 'Disponível', dailyRate: 135, imageUrl: 'https://placehold.co/600x400.png', condition: 'Semi-novo', description: 'Modelo mais recente, super econômico. Ideal para o dia a dia.', paymentInfo: { terms: 'Semanal', methods: ['PIX', 'Boleto'] }, perks: [{ id: 'gvn', label: 'GNV Instalado' }, {id: 'support', label: 'Suporte 24h'}] },
  { make: 'Fiat', model: 'Cronos', year: 2021, status: 'Disponível', dailyRate: 110, imageUrl: 'https://placehold.co/600x400.png', condition: 'Usado', description: 'Porta-malas gigante, perfeito para viagens e aeroporto.', paymentInfo: { terms: 'Diária (Seg-Seg)', methods: ['Dinheiro'] }, perks: [{id: 'tow_truck', label: 'Guincho'}] },
];

export default function RentalsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [make, setMake] = useState('Todas');
    const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const allVehicles = initialVehicles.map((v, i) => ({ ...v, id: `v_${i+1}`, fleetId: 'mockFleetId', createdAt: new Date() }));
    
    const uniqueMakes = useMemo(() => {
        const makes = new Set(allVehicles.map(v => v.make));
        return ['Todas', ...Array.from(makes)];
    }, [allVehicles]);

    const handlePerkChange = (perkId: string) => {
        setSelectedPerks(prev => 
            prev.includes(perkId) 
                ? prev.filter(p => p !== perkId)
                : [...prev, perkId]
        );
    };
    
    const filteredVehicles = useMemo(() => {
        return allVehicles.filter(vehicle => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchLower === '' || vehicle.model.toLowerCase().includes(searchLower) || vehicle.description.toLowerCase().includes(searchLower);
            const matchesMake = make === 'Todas' || vehicle.make === make;
            const matchesPrice = maxPrice === '' || vehicle.dailyRate <= Number(maxPrice);
            const matchesPerks = selectedPerks.length === 0 || selectedPerks.every(pId => vehicle.perks.some(vp => vp.id === pId));
            
            return matchesSearch && matchesMake && matchesPrice && matchesPerks;
        });
    }, [searchTerm, make, maxPrice, selectedPerks, allVehicles]);

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <div><Skeleton className="h-10 w-1/3" /><Skeleton className="mt-2 h-6 w-1/2" /></div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <div className="lg:col-span-1"><Skeleton className="h-96" /></div>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
                </div>
            </div>
        )
    }

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Alugar Veículo</h1>
            <p className="text-muted-foreground">Encontre o carro ideal para você. As melhores frotas estão aqui.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
                <Card>
                    <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="search">Busca por modelo</Label>
                            <Input id="search" placeholder="Ex: Onix, HB20..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="make">Marca</Label>
                            <Select value={make} onValueChange={setMake}><SelectTrigger id="make"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {uniqueMakes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Diária de até (R$)</Label>
                            <Input id="price" type="number" placeholder="Ex: 150" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                        </div>
                        <div className="space-y-3">
                            <Label>Benefícios</Label>
                            <div className="space-y-2">
                                {allPerks.map(perk => (
                                    <div key={perk.id} className="flex items-center space-x-2">
                                        <Checkbox id={perk.id} checked={selectedPerks.includes(perk.id)} onCheckedChange={() => handlePerkChange(perk.id)}/>
                                        <Label htmlFor={perk.id} className="font-normal">{perk.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </aside>

            <main className="lg:col-span-3">
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredVehicles.map(vehicle => (
                        <Card key={vehicle.id} className="flex flex-col overflow-hidden shadow-md transition-all hover:shadow-xl">
                             <CardHeader className="p-0 relative">
                                <Link href={`/rentals/${vehicle.id}`}>
                                    <Image src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="car front view"/>
                                </Link>
                                <Badge className="absolute top-3 right-3 text-lg py-1 px-3 bg-primary/90 text-primary-foreground font-bold border-2 border-primary-foreground/50">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(vehicle.dailyRate)}
                                    <span className="text-xs font-normal ml-1">/dia</span>
                                </Badge>
                            </CardHeader>
                            <CardContent className="flex-1 p-4">
                                <CardTitle className="font-headline text-xl">{vehicle.make} {vehicle.model}</CardTitle>
                                <CardDescription>{vehicle.year} &bull; {vehicle.condition}</CardDescription>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    {vehicle.perks.slice(0, 4).map(perk => {
                                        const PerkIcon = allPerks.find(p => p.id === perk.id)?.icon || Car;
                                        return (
                                            <div key={perk.id} className="flex items-center gap-2">
                                                <PerkIcon className="h-4 w-4 text-primary" />
                                                <span>{perk.label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 bg-muted/50">
                                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    <Link href={`/rentals/${vehicle.id}`}>Ver Detalhes e Alugar</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {filteredVehicles.length === 0 && (
                        <div className="col-span-full text-center text-muted-foreground py-24">
                            <Search className="mx-auto h-12 w-12 mb-4" />
                            <p className="text-lg font-semibold">Nenhum veículo encontrado.</p>
                            <p>Tente ajustar seus filtros de busca ou verifique mais tarde.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
}
