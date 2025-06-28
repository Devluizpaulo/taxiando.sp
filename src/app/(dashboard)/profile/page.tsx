
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth, UserProfile } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const profileFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  phone: z.string().min(10, { message: 'Insira um telefone válido com DDD.' }),
  hasWhatsApp: z.boolean().default(false),
  referenceName: z.string().min(3, { message: 'O nome da referência é obrigatório.' }),
  referenceRelationship: z.string().min(3, { message: 'O parentesco/relação é obrigatório.' }),
  referencePhone: z.string().min(10, { message: 'Insira um telefone de referência válido com DDD.' }),
  financialConsent: z.boolean().refine(val => val === true, {
    message: 'Você deve concordar com a análise financeira.',
  }),
  paymentMethod: z.enum(['credit_card', 'bank_slip', 'pix'], {
    required_error: 'Selecione uma forma de pagamento preferencial.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function CompleteProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            hasWhatsApp: false,
            referenceName: '',
            referenceRelationship: '',
            referencePhone: '',
            financialConsent: false,
        },
    });

    useEffect(() => {
        if (!loading && userProfile) {
            form.reset({
                name: userProfile.name || '',
                phone: userProfile.phone || '',
                hasWhatsApp: userProfile.hasWhatsApp || false,
                referenceName: userProfile.reference?.name || '',
                referenceRelationship: userProfile.reference?.relationship || '',
                referencePhone: userProfile.reference?.phone || '',
                financialConsent: userProfile.financialConsent || false,
                paymentMethod: userProfile.paymentMethod,
            });
        }
    }, [userProfile, loading, form]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    if (!user) {
        router.push('/login');
        return null;
    }

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                name: values.name,
                phone: values.phone,
                hasWhatsApp: values.hasWhatsApp,
                reference: {
                    name: values.referenceName,
                    relationship: values.referenceRelationship,
                    phone: values.referencePhone,
                },
                financialConsent: values.financialConsent,
                paymentMethod: values.paymentMethod,
                profileStatus: 'pending_review',
            });
            toast({
                title: 'Perfil Atualizado!',
                description: 'Seus dados foram enviados para análise. Boa sorte!',
            });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao atualizar',
                description: 'Não foi possível salvar seus dados. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Completar Cadastro</h1>
                <p className="text-muted-foreground">Preencha os campos abaixo para aumentar suas chances de ser aprovado pelas frotas.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Suas Informações</CardTitle>
                    <CardDescription>Estes dados serão usados em sua ficha de pré-análise.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="hasWhatsApp" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-8">
                                        <div className="space-y-0.5"><FormLabel>Este número tem WhatsApp?</FormLabel></div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Contato de Referência</h3>
                                <p className="text-sm text-muted-foreground">Pode ser um familiar ou amigo. As frotas podem entrar em contato.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <FormField control={form.control} name="referenceName" render={({ field }) => (
                                    <FormItem><FormLabel>Nome do Contato</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="referenceRelationship" render={({ field }) => (
                                    <FormItem><FormLabel>Parentesco/Relação</FormLabel><FormControl><Input placeholder="Ex: Pai, Amigo, etc." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="referencePhone" render={({ field }) => (
                                    <FormItem><FormLabel>Telefone do Contato</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Informações Financeiras</h3>
                            </div>

                             <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                                <FormItem className="max-w-xs">
                                    <FormLabel>Forma de Pagamento Preferencial</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                        <SelectItem value="bank_slip">Boleto Bancário</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="financialConsent" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Autorização para Análise Financeira</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                           Autorizo a plataforma a realizar uma análise simplificada do meu histórico financeiro para compartilhar com as frotas.
                                        </p>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}/>
                            
                            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar e Enviar para Análise
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
