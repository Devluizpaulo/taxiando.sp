
'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Vehicle } from '@/lib/types';
import { vehiclePerks as allPerks } from '@/lib/data';
import { getAvailableVehicles } from '@/app/actions/fleet-actions';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { LoadingScreen } from '@/components/loading-screen';
import { VehicleCard } from '@/components/vehicle-card';
import { PageViewTracker } from "@/components/page-view-tracker";

export default function RentalsPage() {
    const [initialVehicles, setInitialVehicles] = useState<Vehicle[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [make, setMake] = useState('Todas');
    const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
    const [maxPrice, setMaxPrice] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            const vehicles = await getAvailableVehicles();
            setInitialVehicles(vehicles);
            setLoading(false);
        };
        fetchVehicles();
    }, []);

    const uniqueMakes = useMemo(() => {
        const makes = new Set(initialVehicles.map(v => v.make));
        return ['Todas', ...Array.from(makes)];
    }, [initialVehicles]);

    const handlePerkChange = (perkId: string) => {
        setSelectedPerks(prev => 
            prev.includes(perkId) 
                ? prev.filter(p => p !== perkId)
                : [...prev, perkId]
        );
    };
    
    const filteredVehicles = useMemo(() => {
        return initialVehicles.filter(vehicle => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchLower === '' || vehicle.model.toLowerCase().includes(searchLower) || vehicle.description.toLowerCase().includes(searchLower);
            const matchesMake = make === 'Todas' || vehicle.make === make;
            const matchesPrice = maxPrice === '' || vehicle.dailyRate <= Number(maxPrice);
            const matchesPerks = selectedPerks.length === 0 || selectedPerks.every(pId => vehicle.perks.some(vp => vp.id === pId));
            
            return matchesSearch && matchesMake && matchesPrice && matchesPerks;
        });
    }, [searchTerm, make, maxPrice, selectedPerks, initialVehicles]);

    return (
        <>
            <PageViewTracker page="rentals" />
            <div className="flex min-h-screen flex-col bg-muted/40">
                <PublicHeader />
                <main className="flex-1">
                    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                         <div className="flex flex-col gap-8">
                            <div>
                                <h1 className="font-headline text-3xl font-bold tracking-tight">Alugar Veículo</h1>
                                <p className="text-muted-foreground">Encontre o carro ideal para você. As melhores frotas estão aqui.</p>
                            </div>
                            
                            {loading ? <LoadingScreen className="h-96" /> : (
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                                    <aside className="lg:col-span-1">
                                        <Card className="sticky top-20">
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
                                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
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
                            )}
                        </div>
                    </div>
                </main>
                <PublicFooter />
            </div>
        </>
    );
}
