
import Link from 'next/link';
import { type Coupon } from '@/lib/types';
import { getAllCoupons } from '@/app/actions/marketing-actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Tag } from 'lucide-react';

const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
        return `${coupon.discountValue}%`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(coupon.discountValue);
};

export default async function AdminCouponsPage() {
    const coupons = await getAllCoupons();

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
                                            {coupon.expiresAt ? format(new Date(coupon.expiresAt as string), "dd/MM/yyyy", { locale: ptBR }) : 'Nunca'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                                                {coupon.isActive ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem>Desativar</DropdownMenuItem>
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
