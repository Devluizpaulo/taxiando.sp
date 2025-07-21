
'use client';

import { useState, useMemo } from 'react';
import { type ServiceListing } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Search } from 'lucide-react';
import { ServiceCard } from '@/components/service-card';

export function MarketplaceClientPage({ initialServices }: { initialServices: ServiceListing[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('Todas');

    const uniqueCategories = useMemo(() => {
        const categories = new Set(initialServices.map(s => s.category));
        return ['Todas', ...Array.from(categories)];
    }, [initialServices]);

    const filteredServices = useMemo(() => {
        return initialServices.filter(service => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchLower === '' || service.title.toLowerCase().includes(searchLower) || service.description.toLowerCase().includes(searchLower) || service.provider.toLowerCase().includes(searchLower);
            const matchesCategory = category === 'Todas' || service.category === category;
            
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, category, initialServices]);

    return (
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Marketplace de Serviços</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        Encontre os melhores serviços e produtos para o seu táxi, oferecidos por parceiros verificados.
                    </p>
                </div>
                
                <Card>
                    <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por serviço ou oficina..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full md:w-[280px]">
                                <SelectValue placeholder="Filtrar por categoria..." />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredServices.map(service => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                    {filteredServices.length === 0 && (
                        <div className="col-span-full text-center text-muted-foreground py-24">
                            <Wrench className="mx-auto h-12 w-12 mb-4" />
                            <p className="text-lg font-semibold">Nenhum serviço encontrado.</p>
                            <p>Tente ajustar seus filtros de busca ou verifique mais tarde.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
