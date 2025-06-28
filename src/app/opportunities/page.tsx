'use client';

import { useState, useMemo } from 'react';
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const allOpportunities = [
  { id: 1, title: "Motorista para Zona Sul (Turno Diurno)", company: "Frota Amarela", location: "Zona Sul", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Pontual", "Experiente"] },
  { id: 2, title: "Vaga Urgente - Aeroporto de Congonhas", company: "SP AeroTaxi", location: "Zona Sul", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Inglês Básico"] },
  { id: 3, title: "Motorista para Eventos Corporativos", company: "Executivo Black", location: "Centro", type: "Freelance", logo: "https://placehold.co/40x40.png", tags: ["Carro Próprio", "Traje Social"] },
  { id: 4, title: "Condutor para Frota Elétrica (Zona Oeste)", company: "Eco-Drive SP", location: "Zona Oeste", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Sustentável"] },
  { id: 5, title: "Motorista para Fim de Semana (Noite)", company: "Night Rider Táxis", location: "Todas", type: "Meio Período", logo: "https://placehold.co/40x40.png", tags: ["Noturno"] },
  { id: 6, title: "Transporte de Pacientes (Zona Leste)", company: "Saúde-Táxi", location: "Zona Leste", type: "Tempo Integral", logo: "https://placehold.co/40x40.png", tags: ["Acessibilidade", "Cuidado"] },
];


export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Todas');
  const [type, setType] = useState('Todos');
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  const handleApply = (jobId: number) => {
    // In a real app, this would make an API call to save the application.
    // Here, we just update the local state to give visual feedback.
    setAppliedJobs(prev => [...prev, jobId]);
  };

  const filteredOpportunities = useMemo(() => {
    return allOpportunities.filter(opp => {
      const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || opp.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = location === 'Todas' || opp.location === location;
      const matchesType = type === 'Todos' || opp.type === type;
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [searchTerm, location, type]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">Encontre sua Próxima Oportunidade</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              As melhores frotas e cooperativas de São Paulo estão contratando aqui.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input 
                  placeholder="Buscar por cargo ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas as Localizações</SelectItem>
                    <SelectItem value="Zona Sul">Zona Sul</SelectItem>
                    <SelectItem value="Zona Leste">Zona Leste</SelectItem>
                    <SelectItem value="Zona Oeste">Zona Oeste</SelectItem>
                    <SelectItem value="Centro">Centro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os Tipos</SelectItem>
                    <SelectItem value="Tempo Integral">Tempo Integral</SelectItem>
                    <SelectItem value="Meio Período">Meio Período</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map(opp => {
              const hasApplied = appliedJobs.includes(opp.id);
              return (
                <Card key={opp.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-headline text-xl">{opp.title}</CardTitle>
                        <CardDescription>{opp.company} - {opp.location}</CardDescription>
                      </div>
                      <Image src={opp.logo} alt={`${opp.company} logo`} width={40} height={40} className="rounded-md" data-ai-hint="company logo" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{opp.type}</Badge>
                      {opp.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => handleApply(opp.id)}
                      disabled={hasApplied}
                    >
                      {hasApplied ? 'Candidatura Enviada' : 'Ver Detalhes e Aplicar'}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
             {filteredOpportunities.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-16">
                    <p className="text-lg">Nenhuma oportunidade encontrada.</p>
                    <p>Tente ajustar seus filtros de busca.</p>
                </div>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
