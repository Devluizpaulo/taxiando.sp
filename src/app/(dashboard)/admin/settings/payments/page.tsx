
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthProtection } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Lock, ExternalLink, Replace } from 'lucide-react';
import { getPaymentSettings, updatePaymentSettings } from '@/app/actions/admin-actions';
import { type PaymentGatewaySettings } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import Link from 'next/link';
import Image from 'next/image';

const settingsFormSchema = z.object({
  activeGateway: z.enum(['mercadoPago', 'stripe']).optional(),
  mercadoPagoPublicKey: z.string().optional(),
  mercadoPagoAccessToken: z.string().optional(),
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function PaymentSettingsPage() {
    const { loading: authLoading } = useAuthProtection({ requiredRoles: ['admin'] });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await getPaymentSettings();
                form.reset({
                    activeGateway: settings.activeGateway || 'mercadoPago',
                    mercadoPagoPublicKey: settings.mercadoPago?.publicKey || '',
                    mercadoPagoAccessToken: settings.mercadoPago?.accessToken || '',
                    stripePublicKey: settings.stripe?.publicKey || '',
                    stripeSecretKey: settings.stripe?.secretKey || '',
                });
            } catch (error) {
                 toast({ variant: 'destructive', title: "Erro", description: "Não foi possível carregar as configurações." });
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchSettings();
    }, [form, toast]);

    const onSubmit = async (values: SettingsFormValues) => {
        setIsSubmitting(true);
        try {
            const settingsToSave: PaymentGatewaySettings = {
                activeGateway: values.activeGateway,
                mercadoPago: {
                    publicKey: values.mercadoPagoPublicKey,
                    accessToken: values.mercadoPagoAccessToken,
                },
                stripe: {
                    publicKey: values.stripePublicKey,
                    secretKey: values.stripeSecretKey,
                }
            };
            const result = await updatePaymentSettings(settingsToSave);

            if (result.success) {
                 toast({ title: 'Sucesso!', description: result.message });
            } else {
                 toast({ variant: 'destructive', title: 'Erro ao Salvar', description: result.error });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro Crítico', description: 'Não foi possível se comunicar com o servidor.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || isLoadingData) {
        return <LoadingScreen />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Configurações de Pagamento</h1>
                    <p className="text-muted-foreground">Gerencie os gateways de pagamento da plataforma.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gateway de Pagamento Ativo</CardTitle>
                        <CardDescription>Selecione qual provedor de pagamento será usado para as transações na plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="activeGateway"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Gateway Ativo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full md:w-1/2">
                                                <SelectValue placeholder="Selecione o gateway ativo..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="mercadoPago">
                                                <div className="flex items-center gap-2">
                                                    <Image src="https://placehold.co/16x16.png" data-ai-hint="mercadopago logo" alt="Mercado Pago" width={16} height={16}/> Mercado Pago
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="stripe">
                                                <div className="flex items-center gap-2">
                                                    <Image src="https://placehold.co/16x16.png" data-ai-hint="stripe logo" alt="Stripe" width={16} height={16}/> Stripe
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credenciais do Mercado Pago</CardTitle>
                            <CardDescription>
                                Credenciais de produção para aceitar pagamentos.
                                <Button variant="link" asChild className="p-1 h-auto"><Link href="https://www.mercadopago.com.br/developers/panel/credentials" target="_blank">Encontre aqui <ExternalLink className="ml-1" /></Link></Button>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="mercadoPagoPublicKey" render={({ field }) => (
                                <FormItem><FormLabel className="flex items-center gap-2"><KeyRound/> Public Key</FormLabel><FormControl><Input {...field} placeholder="APP_USR-..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="mercadoPagoAccessToken" render={({ field }) => (
                                <FormItem><FormLabel className="flex items-center gap-2"><Lock/> Access Token</FormLabel><FormControl><Input type="password" {...field} placeholder="APP_USR-..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Credenciais do Stripe</CardTitle>
                            <CardDescription>
                                Credenciais de produção para aceitar pagamentos.
                                <Button variant="link" asChild className="p-1 h-auto"><Link href="https://dashboard.stripe.com/apikeys" target="_blank">Encontre aqui <ExternalLink className="ml-1" /></Link></Button>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="stripePublicKey" render={({ field }) => (
                                <FormItem><FormLabel className="flex items-center gap-2"><KeyRound/> Publishable Key</FormLabel><FormControl><Input {...field} placeholder="pk_live_..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="stripeSecretKey" render={({ field }) => (
                                <FormItem><FormLabel className="flex items-center gap-2"><Lock/> Secret Key</FormLabel><FormControl><Input type="password" {...field} placeholder="sk_live_..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Configurações
                    </Button>
                </div>
            </form>
        </Form>
    );
}
