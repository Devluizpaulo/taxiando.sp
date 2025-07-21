
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthProtection } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Instagram, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { LoadingScreen } from '@/components/loading-screen';
import { Label } from '@/components/ui/label';

const providerProfileSchema = z.object({
  personType: z.enum(['pf', 'pj']),
  name: z.string().optional(),
  cpf: z.string().optional(),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  companyDescription: z.string().min(20, "A descrição deve ter no mínimo 20 caracteres.").max(500, "A descrição deve ter no máximo 500 caracteres."),
  address: z.string().min(10, "O endereço é obrigatório."),
  contactPhone: z.string().min(10, "O telefone é obrigatório."),
  contactEmail: z.string().email("Email de contato inválido."),
  socialMedia: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
}).superRefine((data, ctx) => {
    if (data.personType === 'pf') {
        if (!data.name || data.name.trim().length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O nome completo é obrigatório.', path: ['name'] });
        }
        const cleanCpf = data.cpf?.replace(/\D/g, '') || '';
        if (cleanCpf.length !== 11) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O CPF é obrigatório e deve ter 11 dígitos.', path: ['cpf'] });
        }
    } else if (data.personType === 'pj') {
        if (!data.nomeFantasia || data.nomeFantasia.trim().length < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O nome fantasia é obrigatório.', path: ['nomeFantasia'] });
        }
         const cleanCnpj = data.cnpj?.replace(/\D/g, '') || '';
         if (cleanCnpj && cleanCnpj.length !== 14) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Se preenchido, o CNPJ deve ter 14 dígitos.', path: ['cnpj'] });
        }
    }
});


type ProviderProfileValues = z.infer<typeof providerProfileSchema>;

export default function ProviderProfilePage() {
    const { user, userProfile, loading } = useAuthProtection({ requiredRoles: ['provider', 'admin'] });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProviderProfileValues>({
        resolver: zodResolver(providerProfileSchema),
        defaultValues: {
            personType: 'pf',
            companyDescription: '',
            address: '',
            contactPhone: '',
            contactEmail: '',
            socialMedia: { instagram: '', facebook: '', whatsapp: '' },
        },
    });

    const personType = form.watch('personType');

    useEffect(() => {
        if (!loading && userProfile) {
            form.reset({
                personType: userProfile.personType || 'pf',
                name: userProfile.name || '',
                cpf: userProfile.cpf || '',
                razaoSocial: userProfile.razaoSocial || '',
                nomeFantasia: userProfile.nomeFantasia || '',
                cnpj: userProfile.cnpj || '',
                companyDescription: userProfile.companyDescription || '',
                address: userProfile.address || '',
                contactPhone: userProfile.phone || '',
                contactEmail: userProfile.email || '',
                socialMedia: userProfile.socialMedia || { instagram: '', facebook: '', whatsapp: '' },
            });
        }
    }, [userProfile, loading, form]);

     if (loading || !userProfile) {
        return <LoadingScreen />;
    }

    const onSubmit = async (values: ProviderProfileValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            const dataToSave = { ...values };
            if (values.personType === 'pf') {
                dataToSave.razaoSocial = '';
                dataToSave.nomeFantasia = '';
                dataToSave.cnpj = '';
            } else {
                dataToSave.name = '';
                dataToSave.cpf = '';
            }

            await updateDoc(userDocRef, {
                ...dataToSave,
                profileStatus: 'pending_review',
            });
            toast({
                title: 'Perfil do Prestador Atualizado!',
                description: 'As informações da sua empresa foram salvas e enviadas para análise.',
            });
        } catch (error) {
            console.error("Error updating provider profile: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao atualizar',
                description: 'Não foi possível salvar os dados. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Perfil do Prestador</h1>
                <p className="text-muted-foreground">Construa um perfil atraente para se destacar para motoristas e frotas.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                         <CardHeader>
                            <CardTitle>Informações da Empresa / Prestador</CardTitle>
                            <CardDescription>Apresente-se para os clientes. Uma boa descrição gera mais confiança.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="personType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Tipo de Conta</FormLabel>
                                    <FormControl>
                                        <Tabs defaultValue={field.value} onValueChange={field.onChange as (value: string) => void} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="pf">Pessoa Física</TabsTrigger>
                                                <TabsTrigger value="pj">Pessoa Jurídica</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {personType === 'pf' ? (
                                <>
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Seu Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome como autônomo" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="cpf" render={({ field }) => (
                                        <FormItem><FormLabel>CPF</FormLabel><FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </>
                            ) : (
                                <>
                                 <FormField control={form.control} name="nomeFantasia" render={({ field }) => (
                                    <FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input placeholder="Nome público da sua empresa" {...field} /></FormControl><FormMessage /></FormItem>
                                 )}/>
                                 <FormField control={form.control} name="razaoSocial" render={({ field }) => (
                                    <FormItem><FormLabel>Razão Social</FormLabel><FormControl><Input placeholder="Nome de registro da empresa" {...field} /></FormControl><FormMessage /></FormItem>
                                 )}/>
                                 <FormField control={form.control} name="cnpj" render={({ field }) => (
                                    <FormItem><FormLabel>CNPJ</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} /></FormControl><FormMessage /></FormItem>
                                 )}/>
                                </>
                            )}
                             <FormField control={form.control} name="companyDescription" render={({ field }) => (
                                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Fale sobre seus serviços, diferenciais, experiência no mercado, etc." {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>Endereço Principal</FormLabel><FormControl><Input placeholder="Rua, Número, Bairro, Cidade - SP" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                             <CardTitle>Informações de Contato</CardTitle>
                             <CardDescription>Como os clientes podem entrar em contato com você.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Telefone Principal</FormLabel><FormControl><Input {...field} placeholder="(11) 9..." /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                    <FormItem><FormLabel>Email Principal</FormLabel><FormControl><Input {...field} placeholder="contato@suaempresa.com" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="space-y-4">
                                <Label>Redes Sociais (Opcional)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="socialMedia.instagram" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><Instagram/> Instagram</FormLabel><FormControl><Input {...field} placeholder="@seu_negocio"/></FormControl></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="socialMedia.facebook" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><FacebookIcon/> Facebook</FormLabel><FormControl><Input {...field} placeholder="/seunegocio"/></FormControl></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="socialMedia.whatsapp" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><MessageSquare/> WhatsApp</FormLabel><FormControl><Input {...field} placeholder="Link para o WhatsApp"/></FormControl></FormItem>
                                    )}/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Perfil
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
