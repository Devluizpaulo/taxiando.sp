
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Lock, ExternalLink } from 'lucide-react';
import { getPaymentSettings, updatePaymentSettings } from '@/app/actions/admin-actions';
import { type PaymentGatewaySettings } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import Link from 'next/link';

const settingsFormSchema = z.object({
  publicKey: z.string().min(10, "A Public Key é obrigatória."),
  accessToken: z.string().min(10, "O Access Token é obrigatório."),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function PaymentSettingsPage() {
    const { loading: authLoading } = useAuthProtection({ requiredRoles: ['admin'] });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            publicKey: '',
            accessToken: '',
        },
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await getPaymentSettings();
                form.reset({
                    publicKey: settings.mercadoPago?.publicKey || '',
                    accessToken: settings.mercadoPago?.accessToken || '',
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
                mercadoPago: {
                    publicKey: values.publicKey,
                    accessToken: values.accessToken,
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
                    <p className="text-muted-foreground">Gerencie a integração com o gateway de pagamento (Mercado Pago).</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Credenciais do Mercado Pago</CardTitle>
                        <CardDescription>
                            Insira suas credenciais de produção para começar a aceitar pagamentos.
                             <Button variant="link" asChild className="p-1 h-auto">
                                <Link href="https://www.mercadopago.com.br/developers/panel/credentials" target="_blank">
                                    Encontre suas credenciais aqui <ExternalLink className="ml-1" />
                                </Link>
                            </Button>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="publicKey" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><KeyRound/> Public Key</FormLabel>
                                <FormControl><Input {...field} placeholder="APP_USR-..." /></FormControl>
                                <FormDescription>Chave pública usada no frontend para inicializar o checkout.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="accessToken" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Lock/> Access Token</FormLabel>
                                <FormControl><Input type="password" {...field} placeholder="APP_USR-..." /></FormControl>
                                <FormDescription>Credencial privada usada no backend para criar pagamentos. Não compartilhe.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>

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
