
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { type Partner } from '@/lib/types';
import { updatePartnerStatus, deletePartner } from '@/app/actions/marketing-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { MoreHorizontal, PlusCircle, Loader2, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const sizeMap = {
    small: 'Pequeno',
    medium: 'Médio',
    large: 'Grande'
};

export function PartnersClientPage({ initialPartners }: { initialPartners: Partner[] }) {
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const { toast } = useToast();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusToggle = async (partner: Partner) => {
        setUpdatingId(partner.id);
        const newStatus = !partner.isActive;
        const result = await updatePartnerStatus(partner.id, newStatus);
        if (result.success) {
            toast({
                title: 'Status do Banner Atualizado!',
                description: `O banner de "${partner.name}" agora está ${newStatus ? 'Ativo' : 'Inativo'}.`,
            });
            setPartners(partners.map(p => p.id === partner.id ? { ...p, isActive: newStatus } : p));
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
        setUpdatingId(null);
    };

    const handleDeletePartner = async (partnerId: string, partnerName: string) => {
        const result = await deletePartner(partnerId);
        if (result.success) {
            toast({ title: 'Parceiro Removido!', description: `O parceiro "${partnerName}" foi removido com sucesso.` });
            setPartners(partners.filter(c => c.id !== partnerId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Banners</h1>
                <p className="text-muted-foreground">Adicione, edite e organize os banners de parceiros e patrocinadores.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todos os Banners</CardTitle>
                        <CardDescription>Visualize e gerencie todos os parceiros cadastrados.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/marketing/partners/create"><PlusCircle /> Adicionar Novo Banner</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Parceiro</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Nenhum parceiro encontrado. Que tal adicionar o primeiro?
                                    </TableCell>
                                </TableRow>
                            ) : (
                                partners.map(partner => (
                                <TableRow key={partner.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Image src={partner.imageUrls?.[0] || 'https://placehold.co/64x32.png'} alt={partner.name} width={64} height={32} className="rounded-md object-contain bg-muted p-1" />
                                        <span>{partner.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{sizeMap[partner.size]}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={partner.isActive ? 'default' : 'secondary'}>
                                            {partner.isActive ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/marketing/partners/${partner.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/> Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled={updatingId === partner.id} onClick={() => handleStatusToggle(partner)}>
                                                        {updatingId === partner.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (partner.isActive ? <><ToggleLeft className="mr-2 h-4 w-4"/>Desativar</> : <><ToggleRight className="mr-2 h-4 w-4"/>Ativar</>)}
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
                                                        Essa ação não pode ser desfeita. Isso irá remover permanentemente o parceiro "{partner.name}" e seu banner da plataforma.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeletePartner(partner.id, partner.name)}>Sim, remover parceiro</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                         </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
