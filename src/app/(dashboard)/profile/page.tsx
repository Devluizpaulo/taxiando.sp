

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, User, FileText, HeartHandshake, Check, ArrowLeft, ArrowRight, Car } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatePicker } from '@/components/ui/datepicker';
import { LoadingScreen } from '@/components/loading-screen';
import { uploadFile } from '@/app/actions/storage-actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const rentalPreferencesSchema = z.object({
    vehicleTypes: z.array(z.string()).optional(),
    transmission: z.enum(['automatic', 'manual', 'indifferent']).optional(),
    fuelTypes: z.array(z.string()).optional(),
    maxDailyRate: z.coerce.number().min(0).optional(),
});

const profileFormSchema = z.object({
  // Perfil
  name: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  photoUrl: z.string().url("URL da foto inválida.").optional().or(z.literal('')),
  photoFile: z.any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `O tamanho máximo do arquivo é 5MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "Apenas os formatos .jpg, .jpeg, .png e .webp são aceitos.")
    .optional(),
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
  
  // Modo de Trabalho e Veículo Próprio
  workMode: z.enum(['owner', 'rental'], { required_error: 'Selecione seu modo de trabalho.' }),
  vehicleLicensePlate: z.string().optional(),
  alvaraExpiration: z.date().optional(),

  // Preferências de Locação
  rentalPreferences: rentalPreferencesSchema.optional(),
  
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
}).superRefine((data, ctx) => {
    if (data.workMode === 'owner') {
        if (!data.vehicleLicensePlate || data.vehicleLicensePlate.trim().length < 7) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A placa do veículo é obrigatória para proprietários.', path: ['vehicleLicensePlate']});
        }
        if (!data.alvaraExpiration) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O vencimento do alvará é obrigatório para proprietários.', path: ['alvaraExpiration']});
        }
    }
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;

const specializedCourseOptions = [
    { id: 'coletivo', label: 'Transporte Coletivo de Passageiros' },
    { id: 'escolar', label: 'Transporte Escolar' },
    { id: 'emergencia', label: 'Veículos de Emergência' },
    { id: 'mopp', label: 'MOPP (Cargas Perigosas)' },
];

const vehicleTypeOptions = [
    { id: 'hatch', label: 'Hatch' },
    { id: 'sedan', label: 'Sedan' },
    { id: 'suv', label: 'SUV' },
    { id: 'minivan', label: 'Minivan' },
];

const fuelTypeOptions = [
    { id: 'flex', label: 'Flex (Gasolina/Álcool)' },
    { id: 'gnv', label: 'GNV' },
    { id: 'diesel', label: 'Diesel' },
    { id: 'eletrico', label: 'Elétrico' },
];


const steps = [
    { id: 1, name: 'Perfil e Contato' },
    { id: 2, name: 'Documentos' },
    { id: 3, name: 'Modo de Trabalho' },
    { id: 4, name: 'Preferências' },
    { id: 5, name: 'Qualificações e Termos' },
];

const Stepper = ({ currentStep }: { currentStep: number }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                {steps.map((step, index) => (
                    <li key={step.name} className="md:flex-1">
                        {currentStep > step.id ? (
                             <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-primary transition-colors">{step.name}</span>
                            </div>
                        ) : currentStep === step.id ? (
                            <div className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                                <span className="text-sm font-medium text-primary">{step.name}</span>
                            </div>
                        ) : (
                             <div className="group flex w-full flex-col border-l-4 border-border py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                <span className="text-sm font-medium text-muted-foreground transition-colors">{step.name}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};


export default function CompleteProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = steps.length;

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        mode: 'onChange',
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
            workMode: 'rental',
            vehicleLicensePlate: '',
            alvaraExpiration: undefined,
            specializedCourses: [],
            rentalPreferences: {
                vehicleTypes: [],
                transmission: 'indifferent',
                fuelTypes: [],
                maxDailyRate: 150,
            },
            referenceName: '',
            referenceRelationship: '',
            referencePhone: '',
            financialConsent: false,
        },
    });
    
    const workMode = form.watch('workMode');
    
    useEffect(() => {
        if (!loading && userProfile) {
            const toDate = (timestamp: any): Date | undefined => timestamp?.toDate ? timestamp.toDate() : undefined;
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
                workMode: userProfile.workMode || 'rental',
                vehicleLicensePlate: userProfile.vehicleLicensePlate || '',
                alvaraExpiration: toDate(userProfile.alvaraExpiration),
                specializedCourses: userProfile.specializedCourses || [],
                rentalPreferences: userProfile.rentalPreferences || { vehicleTypes: [], transmission: 'indifferent', fuelTypes: [], maxDailyRate: 150 },
                referenceName: userProfile.reference?.name || '',
                referenceRelationship: userProfile.reference?.relationship || '',
                referencePhone: userProfile.reference?.phone || '',
                financialConsent: userProfile.financialConsent || false,
            });
        }
    }, [userProfile, loading, form]);
    
    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    if (loading) return <LoadingScreen />;
    if (!user) { router.push('/login'); return null; }

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            let finalPhotoUrl = values.photoUrl;

            if (values.photoFile) {
                const formData = new FormData();
                formData.append('file', values.photoFile);
                toast({ title: "Fazendo upload da imagem...", description: "Aguarde um momento." });
                const uploadResult = await uploadFile(formData, user.uid);
                if (uploadResult.success && uploadResult.url) finalPhotoUrl = uploadResult.url;
                else throw new Error(uploadResult.error || 'Falha no upload da imagem.');
            }
            
            const userDocRef = doc(db, 'users', user.uid);
            const { cnhPoints, photoFile, ...restOfValues } = values;
            const dataToSave = {
                ...restOfValues,
                photoUrl: finalPhotoUrl,
                cnhPoints: cnhPoints === null ? undefined : cnhPoints,
                profileStatus: 'pending_review',
                cnhExpiration: values.cnhExpiration ? Timestamp.fromDate(values.cnhExpiration) : null,
                condutaxExpiration: values.condutaxExpiration ? Timestamp.fromDate(values.condutaxExpiration) : null,
                alvaraExpiration: values.workMode === 'owner' && values.alvaraExpiration ? Timestamp.fromDate(values.alvaraExpiration) : null,
                vehicleLicensePlate: values.workMode === 'owner' ? values.vehicleLicensePlate : null,
                reference: {
                    name: values.referenceName,
                    relationship: values.referenceRelationship,
                    phone: values.referencePhone,
                },
            };
            
            await updateDoc(userDocRef, dataToSave);
            toast({ title: 'Perfil Atualizado!', description: 'Seus dados foram enviados para análise. Boa sorte!' });
            router.push('/dashboard');
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Não foi possível salvar seus dados. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextStep = async () => {
        let fieldsToValidate: (keyof ProfileFormValues)[] = [];
        if (currentStep === 1) fieldsToValidate = ['name', 'phone'];
        if (currentStep === 2) fieldsToValidate = ['cnhNumber', 'cnhCategory', 'cnhExpiration', 'cnhPoints', 'condutaxNumber', 'condutaxExpiration'];
        if (currentStep === 3) fieldsToValidate = ['workMode', 'vehicleLicensePlate', 'alvaraExpiration'];
        if (currentStep === 4) fieldsToValidate = ['rentalPreferences'];
        if (currentStep === 5) fieldsToValidate = ['referenceName', 'referenceRelationship', 'referencePhone', 'financialConsent'];

        const isValid = await form.trigger(fieldsToValidate as any); // Use 'as any' to bypass complex type checking for dynamic validation
        if (isValid && currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Completar Cadastro</h1>
                <p className="text-muted-foreground">Preencha os campos abaixo para aumentar suas chances de ser aprovado pelas frotas.</p>
            </div>
            
            <Card className="p-6">
                <Stepper currentStep={currentStep} />
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* STEP 1: PERFIL & CONTATO */}
                    <div className={cn(currentStep !== 1 && "hidden")}>
                        <Card>
                            <CardHeader><CardTitle>Perfil e Contato</CardTitle><CardDescription>Apresente-se à comunidade. Uma boa foto e um resumo aumentam suas chances.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="photoFile" render={({ field }) => (
                                    <FormItem><FormLabel>Foto de Perfil</FormLabel>
                                        <div className="flex items-center gap-6">
                                            <Avatar className="h-24 w-24"><AvatarImage src={previewUrl || form.watch('photoUrl') || undefined} alt={form.watch('name')} /><AvatarFallback><Camera className="h-8 w-8 text-muted-foreground"/></AvatarFallback></Avatar>
                                            <FormControl><Input type="file" accept="image/*" className="max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                field.onChange(file);
                                                if (file) { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(URL.createObjectURL(file)); } 
                                                else { setPreviewUrl(null); }
                                            }}/></FormControl>
                                        </div>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Breve Resumo Sobre Você</FormLabel><FormControl><Textarea placeholder="Fale um pouco sobre sua experiência como motorista, seus objetivos e o que você busca." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="hasWhatsApp" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-auto"><div><FormLabel>Este número tem WhatsApp?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* STEP 2: DOCUMENTOS */}
                    <div className={cn(currentStep !== 2 && "hidden")}>
                         <Card>
                            <CardHeader><CardTitle>Habilitação e Documentos</CardTitle><CardDescription>Mantenha seus documentos em dia para acessar as melhores oportunidades.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    <FormField control={form.control} name="cnhNumber" render={({ field }) => (<FormItem><FormLabel>Nº da CNH</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="cnhCategory" render={({ field }) => (<FormItem><FormLabel>Categoria CNH</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="cnhExpiration" render={({ field }) => (<FormItem><FormLabel>Vencimento da CNH</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="cnhPoints" render={({ field }) => (<FormItem><FormLabel>Pontos na CNH</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField control={form.control} name="condutaxNumber" render={({ field }) => (<FormItem><FormLabel>Nº do Condutax (Opcional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="condutaxExpiration" render={({ field }) => (<FormItem><FormLabel>Vencimento do Condutax</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* STEP 3: MODO DE TRABALHO */}
                    <div className={cn(currentStep !== 3 && "hidden")}>
                        <Card>
                             <CardHeader><CardTitle>Modo de Trabalho</CardTitle><CardDescription>Como você pretende trabalhar? Isso nos ajuda a encontrar as melhores oportunidades para você.</CardDescription></CardHeader>
                             <CardContent className="space-y-6">
                                <FormField control={form.control} name="workMode" render={({ field }) => (
                                    <FormItem className="space-y-3"><FormLabel>Qual seu modo de trabalho principal?</FormLabel><FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Label htmlFor="rental" className="flex flex-col p-4 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"><RadioGroupItem value="rental" id="rental" className="sr-only"/><span className="font-bold text-lg">Alugo carro de Frota</span><span className="text-sm text-muted-foreground">Busco oportunidades e não preciso me preocupar com a documentação do veículo.</span></Label>
                                            <Label htmlFor="owner" className="flex flex-col p-4 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"><RadioGroupItem value="owner" id="owner" className="sr-only"/><span className="font-bold text-lg">Tenho meu próprio veículo</span><span className="text-sm text-muted-foreground">Sou proprietário(a) e quero usar a plataforma para gerenciar meus documentos.</span></Label>
                                        </RadioGroup>
                                    </FormControl><FormMessage /></FormItem>
                                )}/>
                                {workMode === 'owner' && (
                                    <div className="space-y-4 rounded-lg border bg-muted/50 p-6">
                                        <div className="space-y-1"><h3 className="text-lg font-semibold">Documentação do Veículo Próprio</h3><p className="text-sm text-muted-foreground">Preencha os dados do seu veículo para receber lembretes de vencimento.</p></div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <FormField control={form.control} name="vehicleLicensePlate" render={({ field }) => (<FormItem><FormLabel>Placa do Veículo (Alvará)</FormLabel><FormControl><Input placeholder="ABC-1234" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="alvaraExpiration" render={({ field }) => (<FormItem><FormLabel>Vencimento do Alvará</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
                                        </div>
                                    </div>
                                )}
                             </CardContent>
                        </Card>
                    </div>

                     {/* STEP 4: PREFERÊNCIAS */}
                    <div className={cn(currentStep !== 4 && "hidden")}>
                        <Card>
                            <CardHeader><CardTitle>Preferências de Locação</CardTitle><CardDescription>Descreva o veículo ideal para você. Isso ajuda as frotas a te encontrarem.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="rentalPreferences.vehicleTypes" render={({ field }) => (
                                    <FormItem><FormLabel>Tipos de Veículo</FormLabel><div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                        {vehicleTypeOptions.map((item) => (<FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))}} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel></FormItem>
                                        ))}</div><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="rentalPreferences.fuelTypes" render={({ field }) => (
                                    <FormItem><FormLabel>Tipos de Combustível</FormLabel><div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                        {fuelTypeOptions.map((item) => (<FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))}} /></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel></FormItem>
                                        ))}</div><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="rentalPreferences.transmission" render={({ field }) => (
                                        <FormItem className="space-y-3"><FormLabel>Câmbio</FormLabel><FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4">
                                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="manual" /></FormControl><FormLabel className="font-normal">Manual</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="automatic" /></FormControl><FormLabel className="font-normal">Automático</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="indifferent" /></FormControl><FormLabel className="font-normal">Indiferente</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="rentalPreferences.maxDailyRate" render={({ field }) => (
                                        <FormItem><FormLabel>Valor Máximo da Diária (R$)</FormLabel><FormControl><Input type="number" placeholder="Ex: 150" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* STEP 5: QUALIFICAÇÕES E TERMOS */}
                    <div className={cn(currentStep !== 5 && "hidden")}>
                        <Card>
                            <CardHeader><CardTitle>Cursos e Qualificações</CardTitle><CardDescription>Marque os cursos especializados que você já concluiu.</CardDescription></CardHeader>
                            <CardContent>
                                <FormField control={form.control} name="specializedCourses" render={() => (
                                    <FormItem className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        {specializedCourseOptions.map((item) => (<FormField key={item.id} control={form.control} name="specializedCourses" render={({ field }) => (<FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))}}/></FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel></FormItem>)}/>
                                        ))}
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Contato de Referência e Termos</CardTitle><CardDescription>Informações finais para completar seu perfil.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <FormField control={form.control} name="referenceName" render={({ field }) => (<FormItem><FormLabel>Nome do Contato</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="referenceRelationship" render={({ field }) => (<FormItem><FormLabel>Parentesco/Relação</FormLabel><FormControl><Input placeholder="Ex: Pai, Amigo, etc." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="referencePhone" render={({ field }) => (<FormItem><FormLabel>Telefone do Contato</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                                <FormField control={form.control} name="financialConsent" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none"><FormLabel>Autorização para Análise Financeira</FormLabel><p className="text-sm text-muted-foreground">Autorizo a plataforma a realizar uma análise simplificada do meu histórico financeiro para compartilhar com as frotas.</p><FormMessage /></div>
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex items-center justify-between pt-6">
                        <div>
                            {currentStep > 1 && (<Button type="button" variant="ghost" onClick={handlePrevStep}><ArrowLeft /> Voltar</Button>)}
                        </div>
                        <div>
                            {currentStep < totalSteps && (<Button type="button" onClick={handleNextStep}>Próximo <ArrowRight /></Button>)}
                            {currentStep === totalSteps && (<Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Check className="mr-2"/>Salvar e Enviar para Análise</>}</Button>)}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
