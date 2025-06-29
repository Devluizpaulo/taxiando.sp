'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Event } from '@/lib/types';
import { useAuthProtection } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EventsClientPage({ initialEvents }: { initialEvents: Event[] }) {
    useAuthProtection({ requiredRoles: ['admin'] });
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [loading, setLoading] = useState(false); // Data is pre-fetched, so loading is minimal

    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent className="space-y-2">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Eventos</h1>
                <p className="text-muted-foreground">Adicione, edite e organize os eventos da Agenda Cultural.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todos os Eventos</CardTitle>
                        <CardDescription>Visualize e gerencie todos os eventos cadastrados.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/events/create"><PlusCircle /> Criar Novo Evento</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título do Evento</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead>Data de Início</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Nenhum evento encontrado. Que tal criar o primeiro?
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.title}</TableCell>
                                        <TableCell>{event.location}</TableCell>
                                        <TableCell>
                                            {format(new Date(event.startDate as unknown as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Editar Evento</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive-foreground">Remover</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
