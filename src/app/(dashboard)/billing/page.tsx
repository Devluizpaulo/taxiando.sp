
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type CreditPackage, type Transaction } from '@/lib/types';
import { purchaseCredits } from '@/app/actions/billing-actions';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Loader2, ShoppingCart } from "lucide-react";
import { mockTransactions } from '@/lib/mock-data';
import { LoadingScreen } from '@/components/loading-screen';

export default function BillingPage() {
    const { user, userProfile, setUserProfile, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [loading, setLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

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


    const handlePurchase = async (pkg: CreditPackage) => {
        if (!user) {
            toast({ variant: 'destructive', title: "Erro", description: "Você precisa estar logado para comprar." });
            return;
        }

        setIsPurchasing(pkg.id);

        try {
            // Simulação de chamada à API de pagamento.
            // No futuro, aqui iria a lógica de checkout com o Mercado Pago.
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            await purchaseCredits({
                userId: user.uid,
                packageId: pkg.id,
                packageName: pkg.name,
                credits: pkg.credits,
                amountPaid: pkg.price
            });

            // Atualiza o perfil do usuário no estado local para refletir o novo saldo
            setUserProfile(prev => prev ? { ...prev, credits: (prev.credits || 0) + pkg.credits } : null);
            
            toast({
                title: "Compra Realizada com Sucesso!",
                description: `Você adquiriu ${pkg.credits} créditos.`
            });

        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Erro na Compra",
                description: "Não foi possível processar sua compra. Tente novamente."
            });
             console.error("Purchase error:", error);
        } finally {
            setIsPurchasing(null);
        }
    }

    if (authLoading || loading) {
         return <LoadingScreen />;
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
                    {packages.map(pkg => (
                        <Card key={pkg.id} className="flex flex-col relative overflow-hidden">
                            {pkg.popular && <Badge className="absolute top-2 right-2">Mais Popular</Badge>}
                            <CardHeader>
                                <CardTitle>{pkg.name}</CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-4xl font-bold font-headline text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pkg.price)}
                                </p>
                                <p className="text-sm text-muted-foreground">{pkg.credits} créditos</p>
                            </CardContent>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isPurchasing === pkg.id}>
                                            {isPurchasing === pkg.id ? <Loader2 className="mr-2 animate-spin" /> : <ShoppingCart className="mr-2" />}
                                            {isPurchasing === pkg.id ? 'Processando...' : 'Comprar com Mercado Pago'}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Você está prestes a comprar o pacote "{pkg.name}" por {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pkg.price)}.
                                                <br/>
                                                <span className="text-xs"> (Esta é uma simulação. Nenhum valor será cobrado.)</span>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handlePurchase(pkg)}>Confirmar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
                            {transactions.map(t => (
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
