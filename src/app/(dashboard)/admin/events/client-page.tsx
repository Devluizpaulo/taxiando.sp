
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Event } from '@/lib/types';
import { useAuthProtection } from '@/hooks/use-auth';
import { getAdminEvents, deleteEvent } from '@/app/actions/event-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Trash2, FilePen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { LoadingScreen } from '@/components/loading-screen';

export default function EventsClientPage() {
    const { loading: authLoading } = useAuthProtection({ requiredRoles: ['admin'] });
    const [events, setEvents] = useState<Event[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getAdminEvents().then(data => {
            setEvents(data);
            setDataLoading(false);
        });
    }, []);

    const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
        const result = await deleteEvent(eventId);
        if (result.success) {
            toast({ title: 'Evento Removido!', description: `O evento "${eventTitle}" foi removido com sucesso.` });
            setEvents(events.filter(e => e.id !== eventId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
    };

    if (authLoading || dataLoading) {
        return <LoadingScreen />;
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
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/events/${event.id}/edit`}>
                                                                <FilePen className="mr-2 h-4 w-4"/> Editar Evento
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive-foreground" onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4"/> Remover
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Essa ação não pode ser desfeita. Isso irá remover permanentemente o evento "{event.title}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteEvent(event.id, event.title)}>Sim, remover evento</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
