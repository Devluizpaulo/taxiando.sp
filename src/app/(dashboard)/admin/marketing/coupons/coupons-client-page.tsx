
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { type Coupon } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toDate } from '@/lib/date-utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Tag, Loader2, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateCouponStatus, deleteCoupon } from '@/app/actions/marketing-actions';


const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
        return `${coupon.discountValue}%`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(coupon.discountValue);
};

export function CouponsClientPage({ initialCoupons }: { initialCoupons: Coupon[] }) {
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
    const { toast } = useToast();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusToggle = async (coupon: Coupon) => {
        setUpdatingId(coupon.id);
        const newStatus = !coupon.isActive;
        const result = await updateCouponStatus(coupon.id, newStatus);
        if (result.success) {
            toast({
                title: 'Status do Cupom Atualizado!',
                description: `O cupom "${coupon.code}" agora está ${newStatus ? 'Ativo' : 'Inativo'}.`,
            });
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: newStatus } : c));
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
        setUpdatingId(null);
    };

    const handleDeleteCoupon = async (couponId: string, couponCode: string) => {
        const result = await deleteCoupon(couponId);
        if (result.success) {
            toast({ title: 'Cupom Removido!', description: `O cupom "${couponCode}" foi removido com sucesso.` });
            setCoupons(prev => prev.filter(c => c.id !== couponId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Cupons</h1>
                <p className="text-muted-foreground">Crie e gerencie cupons de desconto para seus usuários.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todos os Cupons</CardTitle>
                        <CardDescription>Visualize e gerencie todos os cupons de desconto.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/marketing/coupons/create"><PlusCircle /> Criar Novo Cupom</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código do Cupom</TableHead>
                                <TableHead>Desconto</TableHead>
                                <TableHead>Uso</TableHead>
                                <TableHead>Expira em</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Nenhum cupom encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map(coupon => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline" className="text-base">
                                                <Tag className="mr-2"/>
                                                {coupon.code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{formatDiscount(coupon)}</TableCell>
                                        <TableCell>{coupon.uses} / {coupon.maxUses ?? '∞'}</TableCell>
                                        <TableCell>
                                            {coupon.expiresAt ? format(toDate(coupon.expiresAt) ?? new Date(), "dd/MM/yyyy", { locale: ptBR }) : 'Nunca'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                                                {coupon.isActive ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                          <Link href={`/admin/marketing/coupons/${coupon.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/> Editar
                                                          </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem disabled={updatingId === coupon.id} onClick={() => handleStatusToggle(coupon)}>
                                                            {updatingId === coupon.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (coupon.isActive ? <><ToggleLeft className="mr-2 h-4 w-4"/>Desativar</> : <><ToggleRight className="mr-2 h-4 w-4"/>Ativar</>)}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4"/> Remover
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita e removerá permanentemente o cupom <span className="font-bold">{coupon.code}</span>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}>Sim, remover</AlertDialogAction>
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
