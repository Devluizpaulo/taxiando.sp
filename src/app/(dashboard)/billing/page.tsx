
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, DollarSign, PlusCircle, ShoppingCart } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';


const creditPackages = [
  { id: 'pkg_10', credits: 10, price: '9,90', priceId: 'price_10_credits' },
  { id: 'pkg_50', credits: 50, price: '44,90', priceId: 'price_50_credits', popular: true },
  { id: 'pkg_100', credits: 100, price: '79,90', priceId: 'price_100_credits' },
];

const mockTransactions = [
  { id: 't_1', date: '25/07/2024', description: 'Compra de 50 créditos', amount: '- R$ 44,90', type: 'debit' },
  { id: 't_2', date: '26/07/2024', description: 'Uso de 2 créditos - Anúncio em Destaque', amount: '- 2 créditos', type: 'credit_usage' },
  { id: 't_3', date: '28/07/2024', description: 'Uso de 1 crédito - Download de Certificado', amount: '- 1 crédito', type: 'credit_usage' },
];

export default function BillingPage() {
    const { userProfile, loading } = useAuth();
    const { toast } = useToast();

    const handlePurchase = (packageName: string) => {
        // Lógica de integração com Mercado Pago viria aqui.
        // Por enquanto, apenas exibimos um toast.
        toast({
            title: "Funcionalidade em Breve!",
            description: `A integração com o Mercado Pago para a compra de ${packageName} está sendo finalizada.`
        });
    }

    if (loading) {
         return (
            <div className="flex flex-col gap-8">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-1/2" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-56" />
                    <Skeleton className="h-56" />
                    <Skeleton className="h-56" />
                </div>
                <Skeleton className="h-64" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Faturamento e Créditos</h1>
                <p className="text-muted-foreground">Gerencie seus créditos, compras e histórico de transações.</p>
            </div>
            
            <Card className="lg:w-1/3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meu Saldo</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{userProfile?.credits ?? 0} créditos</div>
                    <p className="text-xs text-muted-foreground">Use seus créditos para destacar anúncios, emitir certificados e mais.</p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="font-headline text-2xl font-semibold">Comprar Créditos</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {creditPackages.map(pkg => (
                        <Card key={pkg.id} className="flex flex-col relative overflow-hidden">
                            {pkg.popular && <Badge className="absolute top-2 right-2">Mais Popular</Badge>}
                            <CardHeader>
                                <CardTitle>{pkg.credits} Créditos</CardTitle>
                                <CardDescription>Pacote ideal para começar a usar os recursos premium.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-4xl font-bold font-headline text-primary">
                                    R$ {pkg.price}
                                </p>
                                <p className="text-sm text-muted-foreground">Pagamento único via Mercado Pago</p>
                            </CardContent>
                            <CardContent>
                                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handlePurchase(`${pkg.credits} créditos`)}>
                                    <ShoppingCart className="mr-2" /> Comprar com Mercado Pago
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>Acompanhe suas compras e o uso de créditos na plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTransactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.date}</TableCell>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell className={`text-right font-mono ${t.type === 'debit' ? 'text-red-600' : 'text-muted-foreground'}`}>{t.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
