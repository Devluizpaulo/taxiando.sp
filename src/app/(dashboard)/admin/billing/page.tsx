'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type CreditPackage } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { LoadingScreen } from '@/components/loading-screen';

export default function AdminBillingPage() {
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const packagesCollection = collection(db, 'credit_packages');
                const q = query(packagesCollection, orderBy('price', 'asc'));
                const querySnapshot = await getDocs(q);
                const packagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditPackage));
                setPackages(packagesData);
            } catch (error) {
                console.error("Error fetching credit packages: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Editar</DropdownMenuItem>
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
