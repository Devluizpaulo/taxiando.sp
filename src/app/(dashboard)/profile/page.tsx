

'use client';

import 'react-image-crop/dist/ReactCrop.css';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth, type UserProfile } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, User, FileText, HeartHandshake, Check, ArrowLeft, ArrowRight, Car, Languages, FilePlus, BadgeInfo, CreditCard, HomeIcon, Briefcase, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatePicker } from '@/components/ui/datepicker';
import { LoadingScreen } from '@/components/loading-screen';
import { uploadProfileFile } from '@/app/actions/storage-actions-compat';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { partialUpdateUserProfile } from '@/app/actions/user-actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const rentalPreferencesSchema = z.object({
    vehicleTypes: z.array(z.string()).optional(),
    transmission: z.enum(['automatic', 'manual', 'indifferent']).optional(),
    fuelTypes: z.array(z.string()).optional(),
    maxDailyRate: z.coerce.number().min(0).optional(),
});

const workHistorySchema = z.object({
    id: z.string().optional(),
    fleetName: z.string().min(3, "Nome da frota é obrigatório."),
    period: z.string().min(3, "Período é obrigatório."),
    reasonForLeaving: z.string().optional(),
    hasOutstandingDebt: z.boolean().default(false),
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

  // Residência
  address: z.string().min(10, { message: "O endereço completo é obrigatório."}),
  garageInfo: z.enum(['covered', 'uncovered', 'building_garage', 'none'], { required_error: 'Por favor, informe onde o veículo será guardado.'}),

  // Documentos
  cpf: z.string().optional().refine(val => !val || val.replace(/\D/g, '').length === 11, { message: 'Se preenchido, o CPF deve ter 11 dígitos.' }),
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

  // Experiência
  workHistory: z.array(workHistorySchema).optional(),

  // Preferências de Locação
  rentalPreferences: rentalPreferencesSchema.optional(),
  
  // Qualificações
  specializedCourses: z.array(z.string()).optional(),
  languageLevel: z.string().optional(),
  otherCourses: z.string().optional(),


  // Referência
  referenceName: z.string().optional().or(z.literal('')),
  referenceRelationship: z.string().optional().or(z.literal('')),
  referencePhone: z.string().optional().or(z.literal('')),
  
  // Termos
  financialConsent: z.boolean().refine(val => val === true, {
    message: 'Você deve concordar com a análise financeira.',
  }),
  hasCreditCardForDeposit: z.boolean().default(false),
}).superRefine((data, ctx) => {
    if (data.workMode === 'owner') {
        if (!data.vehicleLicensePlate || data.vehicleLicensePlate.trim().length < 7) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A placa do veículo é obrigatória para proprietários.', path: ['vehicleLicensePlate']});
        }
        if (!data.alvaraExpiration) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O vencimento do alvará é obrigatório para proprietários.', path: ['alvaraExpiration']});
        }
    }
    if (data.specializedCourses?.includes('idiomas') && !data.languageLevel) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Por favor, especifique seu nível no idioma.', path: ['languageLevel']});
    }
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;

const specializedCourseOptions = [
    { id: 'condutax', label: 'Curso CONDUTAX' },
    { id: 'coletivo', label: 'Transporte Coletivo de Passageiros' },
    { id: 'escolar', label: 'Transporte Escolar' },
    { id: 'emergencia', label: 'Veículos de Emergência' },
    { id: 'mopp', label: 'MOPP (Cargas Perigosas)' },
    { id: 'idiomas', label: 'Idiomas' },
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
    { id: 'hybrid', label: 'Híbrido' },
    { id: 'eletrico', label: 'Elétrico' },
];


const steps = [
    { id: 1, name: 'Perfil e Contato', fields: ['name', 'photoFile', 'bio', 'phone', 'hasWhatsApp'] },
    { id: 2, name: 'Residência e Veículo', fields: ['address', 'garageInfo', 'workMode', 'vehicleLicensePlate', 'alvaraExpiration'] },
    { id: 3, name: 'Documentos', fields: ['cpf', 'cnhNumber', 'cnhCategory', 'cnhExpiration', 'cnhPoints', 'condutaxNumber', 'condutaxExpiration'] },
    { id: 4, name: 'Experiência Profissional', fields: ['workHistory'] },
    { id: 5, name: 'Preferências de Locação', fields: ['rentalPreferences'] },
    { id: 6, name: 'Qualificações e Referências', fields: ['specializedCourses', 'languageLevel', 'otherCourses', 'referenceName', 'referenceRelationship', 'referencePhone', 'financialConsent', 'hasCreditCardForDeposit'] },
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

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Canvas context not available'));
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/png', 1);
    });
}


export default function CompleteProfilePage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingStep, setIsSavingStep] = useState(false);
    
    // State for image cropping
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
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
            address: '',
            garageInfo: undefined,
            cpf: '',
            cnhNumber: '',
            cnhCategory: undefined,
            cnhExpiration: undefined,
            cnhPoints: null,
            condutaxNumber: '',
            condutaxExpiration: undefined,
            workMode: 'rental',
            vehicleLicensePlate: '',
            alvaraExpiration: undefined,
            workHistory: [],
            specializedCourses: [],
            languageLevel: '',
            otherCourses: '',
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
            hasCreditCardForDeposit: false,
        },
    });
    
    const { fields: historyFields, append: appendHistory, remove: removeHistory } = useFieldArray({
        control: form.control,
        name: "workHistory",
    });

    const workMode = form.watch('workMode');
    const coursesWatch = form.watch('specializedCourses');
    
    // Check which step the user should be on based on their profile data
    const lastCompletedStep = useMemo(() => {
        if (!userProfile) return 0;
        let lastStep = 0;
        for (const step of steps) {
            // Check if all fields for this step are valid according to the schema
            const fieldsAreValid = step.fields.every(field => {
                return form.getFieldState(field as keyof ProfileFormValues).error === undefined;
            });
            if (fieldsAreValid) {
                lastStep = step.id;
            } else {
                break; // Stop at the first step that is not fully valid
            }
        }
        return lastStep;
    }, [userProfile, form]);

    useEffect(() => {
        if (!loading && userProfile && userProfile.profileStatus === 'incomplete') {
            setCurrentStep(lastCompletedStep + 1 > totalSteps ? totalSteps : lastCompletedStep + 1);
        }
    }, [loading, userProfile, lastCompletedStep]);

    useEffect(() => {
        if (!loading && userProfile) {
            const toDate = (timestamp: any): Date | undefined => timestamp?.toDate ? timestamp.toDate() : undefined;
            form.reset({
                name: userProfile.name || '',
                phone: userProfile.phone || '',
                hasWhatsApp: userProfile.hasWhatsApp || false,
                photoUrl: userProfile.photoUrl || '',
                bio: userProfile.bio || '',
                address: userProfile.address || '',
                garageInfo: userProfile.garageInfo || undefined,
                cpf: userProfile.cpf || '',
                cnhNumber: userProfile.cnhNumber || '',
                cnhCategory: userProfile.cnhCategory,
                cnhExpiration: toDate(userProfile.cnhExpiration),
                cnhPoints: userProfile.cnhPoints ?? null,
                condutaxNumber: userProfile.condutaxNumber || '',
                condutaxExpiration: toDate(userProfile.condutaxExpiration),
                workMode: userProfile.workMode || 'rental',
                vehicleLicensePlate: userProfile.vehicleLicensePlate || '',
                alvaraExpiration: toDate(userProfile.alvaraExpiration),
                workHistory: userProfile.workHistory || [],
                specializedCourses: userProfile.specializedCourses || [],
                languageLevel: userProfile.languageLevel || '',
                otherCourses: userProfile.otherCourses || '',
                rentalPreferences: userProfile.rentalPreferences || { vehicleTypes: [], transmission: 'indifferent', fuelTypes: [], maxDailyRate: 150 },
                referenceName: userProfile.reference?.name || '',
                referenceRelationship: userProfile.reference?.relationship || '',
                referencePhone: userProfile.reference?.phone || '',
                financialConsent: userProfile.financialConsent || false,
                hasCreditCardForDeposit: userProfile.hasCreditCardForDeposit || false,
            });
            setPreviewUrl(userProfile.photoUrl || null);
        }
    }, [userProfile, loading, form]);
    
    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    if (loading) return <LoadingScreen />;
    if (!user) { router.push('/login'); return null; }

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Makes crop preview update between images.
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setIsCropModalOpen(true);
            e.target.value = ''; // Allow re-selecting the same file
        }
    };

    const handleCropImage = async () => {
        if (!completedCrop || !imgRef.current) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Nenhuma área de corte selecionada.' });
            return;
        }
        
        try {
            const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
            const croppedFile = new File([croppedBlob], `profile_${user.uid}.png`, { type: 'image/png' });

            if (previewUrl) URL.revokeObjectURL(previewUrl);

            setPreviewUrl(URL.createObjectURL(croppedFile));
            form.setValue('photoFile', croppedFile, { shouldValidate: true, shouldDirty: true });
            toast({ title: 'Foto cortada!', description: 'A nova foto está pronta para ser salva.' });
            setIsCropModalOpen(false);
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Erro ao cortar imagem', description: 'Tente novamente.' });
        }
    };

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            let finalPhotoUrl = values.photoUrl;

            if (values.photoFile) {
                const formData = new FormData();
                formData.append('file', values.photoFile);
                toast({ title: "Fazendo upload da imagem...", description: "Aguarde um momento." });
                const uploadResult = await uploadProfileFile(formData, user.uid, userProfile?.name || 'Usuário');
                if (uploadResult.success && uploadResult.url) finalPhotoUrl = uploadResult.url;
                else throw new Error(uploadResult.error || 'Falha no upload da imagem.');
            }
            
            const userDocRef = doc(db, 'users', user.uid);
            const { cnhPoints, photoFile, referenceName, referenceRelationship, referencePhone, ...restOfValues } = values;
            const dataToSave = {
                ...restOfValues,
                photoUrl: finalPhotoUrl,
                cnhPoints: cnhPoints === null ? undefined : cnhPoints,
                profileStatus: 'pending_review' as const,
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
        const currentStepConfig = steps.find(s => s.id === currentStep);
        if (!currentStepConfig) return;
        
        const fieldsToValidate = currentStepConfig.fields as (keyof ProfileFormValues)[];
        // Allow step 4 (work history) to be skipped even if empty, as it's optional.
        if (currentStep === 4) {
             setIsSavingStep(true);
            try {
                 if (!user) throw new Error("Usuário não encontrado.");
                const values = form.getValues();
                const result = await partialUpdateUserProfile(user.uid, { workHistory: values.workHistory });
                if (!result.success) throw new Error(result.error);
                toast({ title: 'Progresso Salvo!' });
                setCurrentStep(prev => prev + 1);
            } catch(e) {
                 toast({ variant: 'destructive', title: 'Erro ao Salvar', description: (e as Error).message });
            } finally {
                setIsSavingStep(false);
            }
            return;
        }

        const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });

        if (!isValid) {
            toast({
                variant: 'destructive',
                title: 'Campos Incompletos',
                description: 'Por favor, preencha todos os campos obrigatórios corretamente antes de avançar.',
            });
            return;
        }

        if (currentStep < totalSteps) {
            setIsSavingStep(true);
            try {
                if (!user) throw new Error("Usuário não encontrado.");
                
                const values = form.getValues();
                const { photoFile, referenceName, referenceRelationship, referencePhone, ...rest } = values;
                
                const dataToSave: Partial<UserProfile> = {
                    ...rest,
                    cnhPoints: values.cnhPoints === null ? undefined : values.cnhPoints,
                    cnhExpiration: values.cnhExpiration ? Timestamp.fromDate(values.cnhExpiration) : undefined,
                    condutaxExpiration: values.condutaxExpiration ? Timestamp.fromDate(values.condutaxExpiration) : undefined,
                    alvaraExpiration: values.alvaraExpiration ? Timestamp.fromDate(values.alvaraExpiration) : undefined,
                    reference: {
                        name: referenceName || '',
                        relationship: referenceRelationship || '',
                        phone: referencePhone || '',
                    },
                };
                
                const result = await partialUpdateUserProfile(user.uid, dataToSave);

                if (result.success) {
                    toast({ title: 'Progresso Salvo!' });
                    setCurrentStep(prev => prev + 1);
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Salvar',
                    description: (error as Error).message || 'Não foi possível salvar seu progresso.',
                });
            } finally {
                setIsSavingStep(false);
            }
        }
    };


    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };
    
    // Determine which view to show: Stepper for incomplete profiles, or full form for completed ones.
    const isProfileComplete = userProfile?.profileStatus && userProfile.profileStatus !== 'incomplete';

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    {isProfileComplete ? "Meu Perfil" : "Completar Cadastro"}
                </h1>
                <p className="text-muted-foreground">
                    {isProfileComplete 
                        ? "Mantenha seus dados sempre atualizados para garantir as melhores oportunidades."
                        : "Preencha os campos abaixo para aumentar suas chances de ser aprovado pelas frotas."
                    }
                </p>
            </div>
            
            {!isProfileComplete && (
                 <Card className="p-6">
                    <Stepper currentStep={currentStep} />
                </Card>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Multi-step form for initial completion */}
                    {!isProfileComplete ? (
                        <>
                             {/* STEP 1: PERFIL & CONTATO */}
                            <div className={cn(currentStep !== 1 && "hidden")}>
                                <Card>
                                    <CardHeader><CardTitle>Perfil e Contato</CardTitle><CardDescription>Apresente-se à comunidade. Uma boa foto e um resumo aumentam suas chances.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormItem><FormLabel>Foto de Perfil</FormLabel>
                                            <div className="flex items-center gap-6">
                                                <Avatar className="h-24 w-24"><AvatarImage src={previewUrl || undefined} alt={form.watch('name')} /><AvatarFallback><Camera className="h-8 w-8 text-muted-foreground"/></AvatarFallback></Avatar>
                                                <FormControl><Input type="file" accept="image/*" className="max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" onChange={onSelectFile}/></FormControl>
                                            </div>
                                        <FormMessage /></FormItem>
                                        <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Breve Resumo Sobre Você</FormLabel><FormControl><Textarea placeholder="Fale um pouco sobre sua experiência como motorista, seus objetivos e o que você busca." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="hasWhatsApp" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-auto"><div><FormLabel>Este número tem WhatsApp?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                             {/* STEP 2: RESIDÊNCIA E VEÍCULO */}
                             <div className={cn(currentStep !== 2 && "hidden")}>
                                <Card>
                                     <CardHeader>
                                        <CardTitle>Residência e Veículo</CardTitle>
                                        <CardDescription>Informações sobre sua moradia e modo de trabalho.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                         <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Endereço Completo</FormLabel><FormControl><Input placeholder="Rua, Número, Bairro, CEP, Cidade - SP" {...field} /></FormControl><FormDescription>Seu endereço não será público, mas é usado pelas frotas em suas análises.</FormDescription><FormMessage /></FormItem>)}/>
                                        
                                        <FormField control={form.control} name="garageInfo" render={({ field }) => (
                                            <FormItem className="space-y-3 rounded-lg border p-4">
                                                <FormLabel>Onde o veículo ficará guardado durante a noite?</FormLabel>
                                                <FormDescription>Frotas sérias se preocupam com a segurança do veículo. Informar que você tem um local seguro aumenta muito suas chances de aprovação.</FormDescription>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="covered" /></FormControl><FormLabel className="font-normal">Garagem Coberta</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="uncovered" /></FormControl><FormLabel className="font-normal">Garagem Descoberta</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="building_garage" /></FormControl><FormLabel className="font-normal">Garagem de Condomínio/Prédio</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="none" /></FormControl><FormLabel className="font-normal">Na Rua</FormLabel></FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="workMode" render={({ field }) => (
                                            <FormItem className="space-y-3 pt-6 border-t"><FormLabel>Qual seu modo de trabalho principal?</FormLabel><FormControl>
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


                            {/* STEP 3: DOCUMENTOS */}
                            <div className={cn(currentStep !== 3 && "hidden")}>
                                <Card>
                                    <CardHeader><CardTitle>Habilitação e Documentos</CardTitle><CardDescription>Mantenha seus documentos em dia para acessar as melhores oportunidades.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="cpf" render={({ field }) => (<FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>)}/>
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
                            
                            {/* STEP 4: WORK HISTORY */}
                             <div className={cn(currentStep !== 4 && "hidden")}>
                                <Card>
                                     <CardHeader>
                                        <CardTitle>Experiência Profissional</CardTitle>
                                        <CardDescription className="text-base text-amber-800 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">A gente sabe, preencher formulário é chato, né? Mas esta parte é super importante! Conte pra gente suas experiências anteriores. Frotas que conhecem seu histórico conseguem aprovar seu cadastro muito mais rápido. Fique tranquilo, o objetivo aqui é te ajudar a conseguir o melhor carro o mais rápido possível!</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {historyFields.map((field, index) => (
                                            <Card key={field.id} className="p-4 bg-muted/50">
                                                 <div className="flex justify-end mb-2">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHistory(index)} className="h-7 w-7"><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                                                </div>
                                                <div className="space-y-4">
                                                    <FormField control={form.control} name={`workHistory.${index}.fleetName`} render={({ field }) => (<FormItem><FormLabel>Nome da Frota</FormLabel><FormControl><Input {...field} placeholder="Ex: Frota Central" /></FormControl><FormMessage /></FormItem>)}/>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField control={form.control} name={`workHistory.${index}.period`} render={({ field }) => (<FormItem><FormLabel>Período</FormLabel><FormControl><Input {...field} placeholder="Ex: 2021 - 2023" /></FormControl><FormMessage /></FormItem>)}/>
                                                        <FormField control={form.control} name={`workHistory.${index}.reasonForLeaving`} render={({ field }) => (<FormItem><FormLabel>Motivo da Saída (Opcional)</FormLabel><FormControl><Input {...field} placeholder="Ex: Fim de contrato" /></FormControl><FormMessage /></FormItem>)}/>
                                                    </div>
                                                    <FormField control={form.control} name={`workHistory.${index}.hasOutstandingDebt`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Deixou alguma pendência (dívida) nesta frota?</FormLabel></div></FormItem>)}/>
                                                </div>
                                            </Card>
                                        ))}
                                         <Button type="button" variant="outline" size="sm" onClick={() => appendHistory({ fleetName: '', period: '', reasonForLeaving: '', hasOutstandingDebt: false })}>
                                            <PlusCircle /> Adicionar Experiência
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* STEP 5: PREFERÊNCIAS */}
                            <div className={cn(currentStep !== 5 && "hidden")}>
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
                                                <FormItem><FormLabel>Valor Máximo da Diária (R$)</FormLabel><FormControl><Input type="number" placeholder="Ex: 150" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* STEP 6: QUALIFICAÇÕES E REFERÊNCIAS */}
                             <div className={cn(currentStep !== 6 && "hidden")}>
                                <Card>
                                    <CardHeader><CardTitle>Qualificações Adicionais</CardTitle><CardDescription>Destaque seus diferenciais para as frotas.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="specializedCourses" render={() => (
                                            <FormItem><FormLabel>Cursos Especializados Concluídos</FormLabel>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                                                {specializedCourseOptions.map((item) => (<FormField key={item.id} control={form.control} name="specializedCourses" render={({ field }) => (<FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))}}/></FormControl>
                                                    <FormLabel className="font-normal flex items-center gap-2">{item.id === 'idiomas' && <Languages/>} {item.label}</FormLabel></FormItem>)}/>
                                                ))}
                                            </div>
                                            <FormMessage /></FormItem>
                                        )}/>
                                        {coursesWatch?.includes('idiomas') && (
                                            <FormField control={form.control} name="languageLevel" render={({ field }) => (<FormItem><FormLabel>Nível de Idioma</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o nível..." /></SelectTrigger></FormControl>
                                                <SelectContent><SelectItem value="Básico">Básico</SelectItem><SelectItem value="Intermediário">Intermediário</SelectItem><SelectItem value="Avançado">Avançado</SelectItem><SelectItem value="Fluente">Fluente</SelectItem></SelectContent>
                                            </Select><FormMessage /></FormItem>)}/>
                                        )}
                                        <FormField control={form.control} name="otherCourses" render={({ field }) => (
                                            <FormItem><FormLabel className="flex items-center gap-2"><FilePlus/> Outros Cursos e Certificações</FormLabel><FormControl><Textarea placeholder="Liste outros cursos relevantes, separados por vírgula." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Referências e Termos</CardTitle><CardDescription>Informações finais para completar seu perfil.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
                                            <div className="flex items-start gap-3">
                                                <BadgeInfo className="h-5 w-5 text-blue-600 mt-0.5"/>
                                                <p className="text-sm text-blue-800">Esta informação não é obrigatória, mas aumenta significativamente a confiança e as chances de aprovação do seu perfil.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <FormField control={form.control} name="referenceName" render={({ field }) => (<FormItem><FormLabel>Nome do Contato</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="referenceRelationship" render={({ field }) => (<FormItem><FormLabel>Parentesco/Relação</FormLabel><FormControl><Input placeholder="Ex: Pai, Amigo, etc." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name="referencePhone" render={({ field }) => (<FormItem><FormLabel>Telefone do Contato</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                        </div>
                                        <Card>
                                            <CardHeader className="p-4"><CardTitle className="text-base">Segurança Financeira</CardTitle></CardHeader>
                                            <CardContent className="space-y-4 p-4 pt-0">
                                                <FormField control={form.control} name="hasCreditCardForDeposit" render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Você possui cartão de crédito para a locação?</FormLabel>
                                                            <FormDescription className="text-muted-foreground">
                                                                Atenção: não pedimos os dados do seu cartão. Esta é apenas uma confirmação para aumentar suas chances. Frotas de alta qualidade costumam usar o cartão como garantia, e motoristas com essa opção têm preferência na aprovação. Nosso objetivo é te colocar no melhor carro o mais rápido possível para você levar o sustento para casa.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </div>
                                                    </FormItem>
                                                )}/>
                                            </CardContent>
                                        </Card>
                                        <FormField control={form.control} name="financialConsent" render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <div className="space-y-1 leading-none"><FormLabel>Autorização para Análise Financeira</FormLabel><p className="text-sm text-muted-foreground">Autorizo a plataforma a realizar uma análise simplificada do meu histórico financeiro para compartilhar com as frotas.</p><FormMessage /></div>
                                            </FormItem>
                                        )}/>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        // Full form for editing once profile is complete
                        <div className="space-y-8">
                             {/* Conteúdo do formulário completo para edição aqui */}
                            <Card>
                                <CardHeader><CardTitle>Perfil e Contato</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <FormItem><FormLabel>Foto de Perfil</FormLabel>
                                        <div className="flex items-center gap-6">
                                            <Avatar className="h-24 w-24"><AvatarImage src={previewUrl || undefined} alt={form.watch('name')} /><AvatarFallback><Camera className="h-8 w-8 text-muted-foreground"/></AvatarFallback></Avatar>
                                            <FormControl><Input type="file" accept="image/*" className="max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" onChange={onSelectFile}/></FormControl>
                                        </div>
                                    <FormMessage /></FormItem>
                                    <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Breve Resumo Sobre Você</FormLabel><FormControl><Textarea placeholder="Fale um pouco sobre sua experiência como motorista, seus objetivos e o que você busca." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                        <FormField control={form.control} name="hasWhatsApp" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-auto"><div><FormLabel>Este número tem WhatsApp?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* ... Resto do formulário completo ... */}
                            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2"/>}
                                Salvar Alterações
                            </Button>
                        </div>
                    )}


                    {!isProfileComplete && (
                        <div className="flex items-center justify-between pt-6">
                            <div>
                                {currentStep > 1 && (<Button type="button" variant="ghost" onClick={handlePrevStep}><ArrowLeft /> Voltar</Button>)}
                            </div>
                            <div>
                                {currentStep < totalSteps ? (
                                    <Button type="button" onClick={handleNextStep} disabled={isSavingStep}>
                                        {isSavingStep && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Próximo <ArrowRight />
                                    </Button>
                                ) : (
                                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2"/>}
                                        Salvar e Enviar para Análise
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </Form>

            <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cortar Imagem</DialogTitle>
                        <DialogDescription>
                            Ajuste a imagem para o seu perfil. Use uma proporção quadrada.
                        </DialogDescription>
                    </DialogHeader>
                    {imgSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            minHeight={100}
                        >
                            <img ref={imgRef} alt="Crop me" src={imgSrc} style={{ maxHeight: '70vh' }}/>
                        </ReactCrop>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCropImage}>Salvar Foto</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
