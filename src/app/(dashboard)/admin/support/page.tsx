'use client';

import { useState, useEffect } from 'react';
import { type SupportTicket } from '@/lib/types';
import { getSupportTickets, updateTicketStatus } from '@/app/actions/support-actions';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2, MailCheck, MailWarning, Eye } from 'lucide-react';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTickets = async () => {
            const data = await getSupportTickets();
            setTickets(data);
            setLoading(false);
        };
        fetchTickets();
    }, []);

    const handleStatusToggle = async (ticket: SupportTicket) => {
        setUpdatingId(ticket.id);
        const newStatus = ticket.status === 'Open' ? 'Resolved' : 'Open';
        const result = await updateTicketStatus(ticket.id, newStatus);
        
        if (result.success) {
            toast({ title: 'Status do Ticket Atualizado!', description: `O ticket foi marcado como ${newStatus === 'Resolved' ? 'Resolvido' : 'Aberto'}.` });
            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao atualizar', description: result.error });
        }
        setUpdatingId(null);
    };

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsDialogOpen(true);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Caixa de Suporte</h1>
                <p className="text-muted-foreground">Gerencie as mensagens e dúvidas enviadas pelos usuários.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Todos os Tickets</CardTitle>
                    <CardDescription>Visualize e responda às solicitações de suporte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>De</TableHead>
                                <TableHead>Mensagem</TableHead>
                                <TableHead>Recebido em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Nenhum ticket de suporte encontrado.</TableCell>
                                </TableRow>
                            ) : (
                                tickets.map(ticket => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <Badge variant={ticket.status === 'Open' ? 'destructive' : 'default'}>
                                                {ticket.status === 'Open' ? 'Aberto' : 'Resolvido'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{ticket.name}</div>
                                            <div className="text-sm text-muted-foreground">{ticket.email}</div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{ticket.message}</TableCell>
                                        <TableCell>{formatDistanceToNow(new Date(ticket.createdAt as string), { addSuffix: true, locale: ptBR })}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleViewTicket(ticket)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Ver Mensagem
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleStatusToggle(ticket)} disabled={updatingId === ticket.id}>
                                                        {updatingId === ticket.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (
                                                            ticket.status === 'Open' ? <><MailCheck className="mr-2 h-4 w-4"/>Marcar como Resolvido</> : <><MailWarning className="mr-2 h-4 w-4"/>Reabrir Ticket</>
                                                        )}
                                                    </DropdownMenuItem>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Mensagem de Suporte</DialogTitle>
                        <DialogDescription>
                            De: {selectedTicket?.name} ({selectedTicket?.email}) <br/>
                            Recebido em: {selectedTicket && format(new Date(selectedTicket.createdAt as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[50vh] overflow-y-auto">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket?.message}</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Fechar</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
