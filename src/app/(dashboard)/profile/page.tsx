
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatePicker } from '@/components/ui/datepicker';
import { LoadingScreen } from '@/components/loading-screen';

const profileFormSchema = z.object({
  // Perfil
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  photoUrl: z.string().url("URL da foto inválida.").optional().or(z.literal('')),
  bio: z.string().max(300, "O resumo deve ter no máximo 300 caracteres.").optional(),

  // Contato
  phone: z.string().min(10, { message: 'Insira um telefone válido com DDD.' }),
  hasWhatsApp: z.boolean().default(false),

  // Documentos
  cnhNumber: z.string().min(5, "Número da CNH inválido.").optional().or(z.literal('')),
  cnhCategory: z.enum(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE']).optional(),
  cnhExpiration: z.date().optional(),
  cnhPoints: z.coerce.number().min(0).max(40).optional().nullable(),
  condutaxNumber: z.string().optional(),
  condutaxExpiration: z.date().optional(),
  vehicleLicensePlate: z.string().optional(),
  alvaraExpiration: z.date().optional(),
  
  // Qualificações
  specializedCourses: z.array(z.string()).optional(),

  // Referência
  referenceName: z.string().min(3, { message: 'O nome da referência é obrigatório.' }),
  referenceRelationship: z.string().min(3, { message: 'O parentesco/relação é obrigatório.' }),
  referencePhone: z.string().min(10, { message: 'Insira um telefone de referência válido com DDD.' }),
  
  // Termos
  financialConsent: z.boolean().refine(val => val === true, {
    message: 'Você deve concordar com a análise financeira.',
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const specializedCourseOptions = [
    { id: 'coletivo', label: 'Transporte Coletivo de Passageiros' },
    { id: 'escolar', label: 'Transporte Escolar' },
    { id: 'emergencia', label: 'Veículos de Emergência' },
    { id: 'mopp', label: 'MOPP (Cargas Perigosas)' },
];

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
            photoUrl: '',
            bio: '',
            cnhNumber: '',
            cnhCategory: undefined,
            cnhExpiration: undefined,
            cnhPoints: null,
            condutaxNumber: '',
            condutaxExpiration: undefined,
            vehicleLicensePlate: '',
            alvaraExpiration: undefined,
            specializedCourses: [],
            referenceName: '',
            referenceRelationship: '',
            referencePhone: '',
            financialConsent: false,
        },
    });

    useEffect(() => {
        if (!loading && userProfile) {
            // Helper to convert Firestore Timestamp to JS Date
            const toDate = (timestamp: any): Date | undefined => {
                return timestamp?.toDate ? timestamp.toDate() : undefined;
            }

            form.reset({
                name: userProfile.name || '',
                phone: userProfile.phone || '',
                hasWhatsApp: userProfile.hasWhatsApp || false,
                photoUrl: userProfile.photoUrl || '',
                bio: userProfile.bio || '',
                cnhNumber: userProfile.cnhNumber || '',
                cnhCategory: userProfile.cnhCategory,
                cnhExpiration: toDate(userProfile.cnhExpiration),
                cnhPoints: userProfile.cnhPoints ?? null,
                condutaxNumber: userProfile.condutaxNumber || '',
                condutaxExpiration: toDate(userProfile.condutaxExpiration),
                vehicleLicensePlate: userProfile.vehicleLicensePlate || '',
                alvaraExpiration: toDate(userProfile.alvaraExpiration),
                specializedCourses: userProfile.specializedCourses || [],
                referenceName: userProfile.reference?.name || '',
                referenceRelationship: userProfile.reference?.relationship || '',
                referencePhone: userProfile.reference?.phone || '',
                financialConsent: userProfile.financialConsent || false,
            });
        }
    }, [userProfile, loading, form]);

    if (loading) {
        return <LoadingScreen />;
    }
    
    if (!user) {
        router.push('/login');
        return null;
    }

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            const { cnhPoints, ...restOfValues } = values;

            const dataToSave = {
                ...restOfValues,
                cnhPoints: cnhPoints === null ? undefined : cnhPoints, // Store as undefined if null
                profileStatus: 'pending_review',
                cnhExpiration: values.cnhExpiration ? Timestamp.fromDate(values.cnhExpiration) : null,
                condutaxExpiration: values.condutaxExpiration ? Timestamp.fromDate(values.condutaxExpiration) : null,
                alvaraExpiration: values.alvaraExpiration ? Timestamp.fromDate(values.alvaraExpiration) : null,
                reference: {
                    name: values.referenceName,
                    relationship: values.referenceRelationship,
                    phone: values.referencePhone,
                },
            };
            
            await updateDoc(userDocRef, dataToSave);

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

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                         <CardHeader>
                            <CardTitle>Perfil e Contato</CardTitle>
                            <CardDescription>Apresente-se à comunidade. Uma boa foto e um resumo aumentam suas chances.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={form.watch('photoUrl') || undefined} alt={form.watch('name')} />
                                    <AvatarFallback><Camera className="h-8 w-8 text-muted-foreground"/></AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 gap-2">
                                     <FormField control={form.control} name="photoUrl" render={({ field }) => (
                                        <FormItem><FormLabel>URL da Foto de Perfil</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <p className="text-xs text-muted-foreground">Cole a URL de uma foto sua. Use um serviço como <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="underline">imgbb.com</a> para hospedar.</p>
                                </div>
                            </div>

                             <FormField control={form.control} name="bio" render={({ field }) => (
                                <FormItem><FormLabel>Breve Resumo Sobre Você</FormLabel><FormControl><Textarea placeholder="Fale um pouco sobre sua experiência como motorista, seus objetivos e o que você busca." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )}/>

                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="hasWhatsApp" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-auto">
                                        <div className="space-y-0.5"><FormLabel>Este número tem WhatsApp?</FormLabel></div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Habilitação e Documentos</CardTitle>
                            <CardDescription>Mantenha seus documentos em dia para acessar as melhores oportunidades.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <FormField control={form.control} name="cnhNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Nº da CNH</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="cnhCategory" render={({ field }) => (
                                    <FormItem><FormLabel>Categoria CNH</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                            <SelectContent>{['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="cnhExpiration" render={({ field }) => (
                                    <FormItem><FormLabel>Vencimento da CNH</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="cnhPoints" render={({ field }) => (
                                    <FormItem><FormLabel>Pontos na CNH</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                             <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <FormField control={form.control} name="condutaxNumber" render={({ field }) => (
                                    <FormItem><FormLabel>Nº do Condutax (Opcional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="condutaxExpiration" render={({ field }) => (
                                    <FormItem><FormLabel>Vencimento do Condutax</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                             </div>
                            
                            <div className="space-y-4 rounded-lg border bg-muted/50 p-6">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold">Meu Veículo (Opcional)</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Possui veículo próprio? Cadastre-o para acompanhar o vencimento de documentos e receber alertas.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                     <FormField control={form.control} name="vehicleLicensePlate" render={({ field }) => (
                                        <FormItem><FormLabel>Placa do Veículo (Alvará)</FormLabel><FormControl><Input placeholder="ABC-1234" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="alvaraExpiration" render={({ field }) => (
                                        <FormItem><FormLabel>Vencimento do Alvará</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cursos e Qualificações</CardTitle>
                            <CardDescription>Marque os cursos especializados que você já concluiu.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="specializedCourses"
                                render={() => (
                                    <FormItem className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {specializedCourseOptions.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="specializedCourses"
                                        render={({ field }) => (
                                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), item.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.id
                                                        )
                                                    )
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                            </FormItem>
                                        )}
                                        />
                                    ))}
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle>Contato de Referência e Termos</CardTitle>
                             <CardDescription>Informações finais para completar seu perfil.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                        </CardContent>
                    </Card>
                    
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar e Enviar para Análise
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
