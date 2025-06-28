'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, Phone, Mail, Instagram, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const providerProfileSchema = z.object({
  personType: z.enum(['pf', 'pj']),
  name: z.string().optional(),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  companyDescription: z.string().min(20, "A descrição deve ter no mínimo 20 caracteres.").max(500, "A descrição deve ter no máximo 500 caracteres."),
  address: z.string().min(10, "O endereço é obrigatório."),
  contactPhone: z.string().min(10, "O telefone é obrigatório."),
  contactEmail: z.string().email("Email de contato inválido."),
  socialMedia: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
}).refine(data => {
    if (data.personType === 'pf') return data.name && data.name.length >= 3;
    return true;
}, { message: 'O nome completo é obrigatório.', path: ['name']})
.refine(data => {
    if (data.personType === 'pj') return data.nomeFantasia && data.nomeFantasia.length >= 3;
    return true;
}, { message: 'O nome fantasia é obrigatório.', path: ['nomeFantasia']});

type ProviderProfileValues = z.infer<typeof providerProfileSchema>;

export default function ProviderProfilePage() {
    const { user, userProfile, loading } = useAuth();
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
                razaoSocial: userProfile.razaoSocial || '',
                nomeFantasia: userProfile.nomeFantasia || '',
                companyDescription: userProfile.companyDescription || '',
                address: userProfile.address || '',
                contactPhone: userProfile.phone || '',
                contactEmail: userProfile.email || '',
                socialMedia: userProfile.socialMedia || { instagram: '', facebook: '', whatsapp: '' },
            });
        }
    }, [userProfile, loading, form]);

     if (loading || !userProfile) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const onSubmit = async (values: ProviderProfileValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                ...values,
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
                                        <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
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
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Seu Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome como autônomo" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            ) : (
                                <>
                                 <FormField control={form.control} name="nomeFantasia" render={({ field }) => (
                                    <FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input placeholder="Nome público da sua empresa" {...field} /></FormControl><FormMessage /></FormItem>
                                 )}/>
                                 <FormField control={form.control} name="razaoSocial" render={({ field }) => (
                                    <FormItem><FormLabel>Razão Social</FormLabel><FormControl><Input placeholder="Nome de registro da empresa" {...field} /></FormControl><FormMessage /></FormItem>
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
