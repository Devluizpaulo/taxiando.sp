
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { type CreditPackage } from '@/lib/types';
import { deleteCreditPackage } from '@/app/actions/billing-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingScreen } from '@/components/loading-screen';


export function BillingClientPage({ initialPackages }: { initialPackages: CreditPackage[] }) {
    const [packages, setPackages] = useState<CreditPackage[]>(initialPackages);
    const { toast } = useToast();

    const handleDeletePackage = async (packageId: string, packageName: string) => {
        const result = await deleteCreditPackage(packageId);
        if (result.success) {
            toast({ title: 'Pacote Removido!', description: `O pacote "${packageName}" foi removido com sucesso.` });
            setPackages(prev => prev.filter(p => p.id !== packageId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Créditos</h1>
                <p className="text-muted-foreground">Crie e gerencie os pacotes de crédito disponíveis para compra.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Pacotes de Crédito</CardTitle>
                        <CardDescription>Visualize e gerencie todos os pacotes de crédito.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/billing/create"><PlusCircle /> Criar Novo Pacote</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome do Pacote</TableHead>
                                <TableHead>Créditos</TableHead>
                                <TableHead>Preço (R$)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Nenhum pacote de crédito encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                packages.map(pkg => (
                                    <TableRow key={pkg.id}>
                                        <TableCell className="font-medium">{pkg.name}</TableCell>
                                        <TableCell>{pkg.credits}</TableCell>
                                        <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pkg.price)}</TableCell>
                                        <TableCell>
                                            {pkg.popular && <Badge>Popular</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                          <Link href={`/admin/billing/${pkg.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4"/> Editar
                                                          </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Remover
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação removerá o pacote "{pkg.name}" permanentemente.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeletePackage(pkg.id, pkg.name)}>Sim, remover pacote</AlertDialogAction>
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
