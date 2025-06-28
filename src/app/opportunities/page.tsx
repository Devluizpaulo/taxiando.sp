
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Wrench, Search, MapPin, Clock } from "lucide-react";

// Mock data
const jobOpportunities = [
  { id: 'job_1', title: "Motorista para Zona Sul (Turno Diurno)", company: "Frota Amarela", location: "Zona Sul", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Pontual", "Experiente"] },
  { id: 'job_2', title: "Vaga Urgente - Aeroporto de Congonhas", company: "SP AeroTaxi", location: "Zona Sul", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Inglês Básico"] },
  { id: 'job_3', title: "Motorista para Eventos Corporativos", company: "Executivo Black", location: "Centro", type: "Freelance", logo: "https://placehold.co/40x40.png", tags: ["Carro Próprio", "Traje Social"] },
];

const serviceListings = [
    { id: 'srv_1', title: 'Despachante Veicular Completo', provider: 'Despachante Legal', category: 'Despachante', price: 'R$ 550,00', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'documents stamp' },
    { id: 'srv_2', title: 'Curso de Reciclagem para Taxistas', provider: 'Autoescola Futuro', category: 'Autoescola', price: 'R$ 300,00', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'classroom training' },
    { id: 'srv_3', title: 'Instalação de GNV 5ª Geração', provider: 'GNV Master', category: 'Instaladora GNV', price: 'Sob Consulta', imageUrl: 'https://placehold.co/600x400.png', imageHint: 'car engine' },
];

export default function OpportunitiesMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedOpportunities, setAppliedOpportunities] = useState<string[]>([]);
  const { toast } = useToast();

  const handleApply = (opportunityId: string, title: string) => {
    setAppliedOpportunities(prev => [...prev, opportunityId]);
    toast({
        title: "Candidatura Enviada!",
        description: `Sua candidatura para "${title}" foi registrada. Você pode acompanhar em "Minhas Candidaturas" no seu painel.`,
    });
  };
  
  const handleContact = (serviceId: string, title: string) => {
    toast({
        title: "Interesse Registrado!",
        description: `O prestador do serviço "${title}" será notificado.`,
    });
  };

  const filteredJobs = useMemo(() => {
    return jobOpportunities.filter(opp => 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        opp.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredServices = useMemo(() => {
    return serviceListings.filter(srv => 
        srv.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        srv.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">Oportunidades e Marketplace</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Encontre vagas de trabalho e os melhores serviços para seu dia a dia.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por vaga, serviço, empresa ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        
        <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="jobs"><Briefcase /> Vagas de Emprego</TabsTrigger>
                <TabsTrigger value="services"><Wrench /> Serviços e Produtos</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs" className="pt-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map(opp => {
                const hasApplied = appliedOpportunities.includes(opp.id);
                return (
                    <Card key={opp.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="font-headline text-xl">{opp.title}</CardTitle>
                            <CardDescription>{opp.company}</CardDescription>
                        </div>
                        <Image src={opp.logo} alt={`${opp.company} logo`} width={40} height={40} className="rounded-md" data-ai-hint="company logo"/>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin/> {opp.location}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock/> {opp.type}</div>
                        <div className="flex flex-wrap gap-2 pt-2">
                         {opp.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleApply(opp.id, opp.title)} disabled={hasApplied}>
                        {hasApplied ? 'Candidatura Enviada' : 'Ver Vaga e Aplicar'}
                        </Button>
                    </CardFooter>
                    </Card>
                )
                })}
                {filteredJobs.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-16">
                        <p className="text-lg">Nenhuma vaga encontrada.</p>
                    </div>
                )}
                </div>
            </TabsContent>
            <TabsContent value="services" className="pt-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {filteredServices.map(srv => (
                    <Card key={srv.id} className="flex flex-col overflow-hidden">
                        <CardHeader className="p-0">
                            <Image src={srv.imageUrl} alt={srv.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint={srv.imageHint}/>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                            <Badge variant="secondary" className="mb-2">{srv.category}</Badge>
                            <CardTitle className="font-headline text-lg">{srv.title}</CardTitle>
                            <CardDescription>Oferecido por: {srv.provider}</CardDescription>
                        </CardContent>
                        <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
                           <p className="text-lg font-bold text-primary">{srv.price}</p>
                           <Button onClick={() => handleContact(srv.id, srv.title)}>Contratar</Button>
                        </CardFooter>
                    </Card>
                 ))}
                  {filteredServices.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-16">
                        <p className="text-lg">Nenhum serviço encontrado.</p>
                    </div>
                )}
                </div>
            </TabsContent>
        </Tabs>
      </div>
      </main>
      <PublicFooter />
    </div>
  );
}
