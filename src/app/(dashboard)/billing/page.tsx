
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type CreditPackage, type Transaction } from '@/lib/types';
import { purchaseCredits, createPaymentPreference } from '@/app/actions/billing-actions';
import { getPaymentSettings } from '@/app/actions/admin-actions';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Loader2, ShoppingCart, AlertCircle, Tag, Ticket } from "lucide-react";
import { LoadingScreen } from '@/components/loading-screen';
import { Input } from '@/components/ui/input';

export default function BillingPage() {
    const { user, userProfile, setUserProfile, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingPreference, setIsCreatingPreference] = useState<string | null>(null);
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
    const [mercadoPagoKey, setMercadoPagoKey] = useState<string | null>(null);
    const [couponCode, setCouponCode] = useState('');

    useEffect(() => {
        const status = searchParams.get('status');
        if (status === 'failure') {
            toast({
                variant: 'destructive',
                title: "Pagamento Falhou",
                description: "Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente."
            });
        }
        if (status === 'pending') {
            toast({
                title: "Pagamento Pendente",
                description: "Seu pagamento está sendo processado. Avisaremos quando for aprovado."
            });
        }
    }, [searchParams, toast]);

     useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [packagesSnapshot, settings] = await Promise.all([
                    getDocs(query(collection(db, 'credit_packages'), orderBy('price', 'asc'))),
                    getPaymentSettings()
                ]);

                const packagesData = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditPackage));
                setPackages(packagesData);

                if (settings.mercadoPago.publicKey) {
                    setMercadoPagoKey(settings.mercadoPago.publicKey);
                    initMercadoPago(settings.mercadoPago.publicKey, { locale: 'pt-BR' });
                }

            } catch (error) {
                console.error("Error fetching page data: ", error);
                 toast({ variant: 'destructive', title: "Erro ao Carregar", description: "Não foi possível carregar os pacotes." });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [toast]);

    useEffect(() => {
        if (!user) return;

        const transCollectionRef = collection(db, 'users', user.uid, 'transactions');
        const q = query(transCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userTransactions: Transaction[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                userTransactions.push({
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                } as Transaction);
            });
            setTransactions(userTransactions);
        });

        return () => unsubscribe();
    }, [user]);


    const handlePurchaseAttempt = async (pkg: CreditPackage) => {
        if (!user) {
            toast({ variant: 'destructive', title: "Erro", description: "Você precisa estar logado para comprar." });
            return;
        }
        if (!mercadoPagoKey) {
            toast({ variant: 'destructive', title: "Erro de Configuração", description: "O sistema de pagamento não está configurado. Contate o suporte." });
            return;
        }

        setIsCreatingPreference(pkg.id);
        setPreferenceId(null);
        setSelectedPackage(pkg);

        try {
            const result = await createPaymentPreference({
                packageId: pkg.id,
                userId: user.uid,
                couponCode: couponCode || undefined,
            });

            if (result.success && result.preferenceId) {
                setPreferenceId(result.preferenceId);
                 if (result.discountApplied) {
                    toast({ title: "Cupom Aplicado!", description: `Desconto de ${result.discountApplied.description} aplicado com sucesso.`});
                }
            } else {
                throw new Error(result.error || "ID de preferência não retornado.");
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Erro ao Iniciar Pagamento",
                description: (error as Error).message || "Não foi possível iniciar o processo de pagamento. Tente novamente."
            });
             console.error("Preference creation error:", error);
             setSelectedPackage(null);
        } finally {
            setIsCreatingPreference(null);
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
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Meu Saldo</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userProfile?.credits ?? 0} créditos</div>
                        <p className="text-xs text-muted-foreground">Use seus créditos para destacar anúncios, emitir certificados e mais.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cupom de Desconto</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Input 
                                placeholder="Insira seu cupom" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            />
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">Possui um código? Insira aqui antes de escolher o pacote.</p>
                    </CardContent>
                </Card>
            </div>


            <div className="space-y-4">
                <h2 className="font-headline text-2xl font-semibold">Comprar Créditos</h2>
                {!mercadoPagoKey && (
                    <Card className="border-destructive bg-destructive/10">
                        <CardHeader className="flex-row items-center gap-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                            <div>
                                <CardTitle className="text-destructive">Sistema de Pagamento Indisponível</CardTitle>
                                <CardDescription className="text-destructive/80">O administrador não configurou o gateway de pagamento. Não é possível realizar compras no momento.</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                )}
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
                                {selectedPackage?.id === pkg.id && preferenceId ? (
                                    <Wallet
                                        initialization={{ preferenceId: preferenceId }}
                                        customization={{ texts: { valueProp: 'smart_option' } }}
                                        onSubmit={async (formData) => {
                                            // Este callback é chamado quando o pagamento é processado no lado do MP.
                                            // A atualização de créditos DEVE ser feita via Webhook para segurança.
                                            // Para fins de demonstração, vamos chamar a ação aqui.
                                            if (user && formData.status === 'approved') {
                                                await purchaseCredits({
                                                    userId: user.uid,
                                                    packageId: pkg.id,
                                                    packageName: pkg.name,
                                                    credits: pkg.credits,
                                                    amountPaid: pkg.price,
                                                    paymentId: formData.id?.toString() || 'N/A'
                                                });
                                                setUserProfile(prev => prev ? { ...prev, credits: (prev.credits || 0) + pkg.credits } : null);
                                                toast({
                                                    title: "Compra Aprovada!",
                                                    description: `Você adquiriu ${pkg.credits} créditos.`
                                                });
                                            }
                                        }}
                                    />
                                ) : (
                                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handlePurchaseAttempt(pkg)} disabled={isCreatingPreference === pkg.id || !mercadoPagoKey}>
                                        {isCreatingPreference === pkg.id ? <Loader2 className="mr-2 animate-spin" /> : <ShoppingCart className="mr-2" />}
                                        {isCreatingPreference === pkg.id ? 'Aguarde...' : 'Comprar com Mercado Pago'}
                                    </Button>
                                )}
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
                            {transactions.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">Nenhum histórico de transações.</TableCell>
                                </TableRow>
                            ) : (
                                transactions.map(t => {
                                    const date = new Date(t.createdAt as string).toLocaleDateString('pt-BR');
                                    let description = "Transação desconhecida";
                                    let amount = "";

                                    if (t.type === 'purchase') {
                                        description = `Compra: ${t.packageName}`;
                                        amount = `- R$ ${t.amountPaid?.toFixed(2)}`;
                                    } else if (t.type === 'usage') {
                                        description = t.usageReason || 'Uso de créditos';
                                        amount = `- ${t.creditsUsed} créditos`;
                                    }

                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell>{date}</TableCell>
                                            <TableCell className="font-medium">{description}</TableCell>
                                            <TableCell className={`text-right font-mono ${t.type === 'purchase' ? 'text-red-600' : 'text-primary'}`}>{amount}</TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
