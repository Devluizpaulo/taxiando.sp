

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
import { Loader2, Camera, User, FileText, HeartHandshake, Check, ArrowLeft, ArrowRight, Car, Languages, FilePlus, BadgeInfo, CreditCard, HomeIcon, Briefcase, PlusCircle, Trash2, Search, Phone as PhoneIcon } from 'lucide-react';
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
import { FirebaseImageUpload } from '@/components/ui/firebase-image-upload';


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
    address: z.string().min(10, { message: "O endereço completo é obrigatório." }),
    garageInfo: z.enum(['covered', 'uncovered', 'building_garage', 'none'], { required_error: 'Por favor, informe onde o veículo será guardado.' }),

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
    alvaraInspectionDate: z.date().optional(),
    ipemInspectionDate: z.date().optional(),
    licensingExpiration: z.date().optional(),

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
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A placa do veículo é obrigatória para proprietários.', path: ['vehicleLicensePlate'] });
        }
        if (!data.alvaraExpiration) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'O vencimento do alvará é obrigatório para proprietários.', path: ['alvaraExpiration'] });
        }
    }
    if (data.specializedCourses?.includes('idiomas') && !data.languageLevel) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Por favor, especifique seu nível no idioma.', path: ['languageLevel'] });
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

const Stepper = ({
    currentStep,
    onStepClick,
    isStepCompleted
}: {
    currentStep: number;
    onStepClick: (stepId: number) => void;
    isStepCompleted: (stepId: number) => boolean;
}) => {
    return (
        <div className="flex items-center justify-between">
            {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = isStepCompleted(step.id);
                const isClickable = true; // Permitir navegação livre

                return (
                    <div key={step.id} className="flex items-center">
                        <button
                            type="button"
                            onClick={() => isClickable && onStepClick(step.id)}
                            disabled={!isClickable}
                            className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                                isActive && "bg-primary border-primary text-primary-foreground",
                                isCompleted && "bg-green-500 border-green-500 text-white",
                                !isActive && !isCompleted && "border-gray-300 text-gray-500 hover:border-gray-400",
                                isClickable && "cursor-pointer hover:scale-105",
                                !isClickable && "cursor-not-allowed"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <span className="text-sm font-medium">{step.id}</span>
                            )}
                        </button>

                        <div className="ml-3 flex-1">
                            <p className={cn(
                                "text-sm font-medium",
                                isActive && "text-primary",
                                isCompleted && "text-green-600",
                                !isActive && !isCompleted && "text-gray-500"
                            )}>
                                {step.name}
                            </p>
                            {isActive && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Etapa atual
                                </p>
                            )}
                            {isCompleted && (
                                <p className="text-xs text-green-600 mt-1">
                                    Preenchida
                                </p>
                            )}
                            </div>

                        {index < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 mx-4 transition-colors duration-200",
                                isCompleted ? "bg-green-500" : "bg-gray-300"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
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
    const [isAddressAutoFilled, setIsAddressAutoFilled] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [cepError, setCepError] = useState<string | null>(null);
    
    // State for image cropping
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
            alvaraInspectionDate: undefined,
            ipemInspectionDate: undefined,
            licensingExpiration: undefined,
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

    // Hook personalizado para buscar CEP
    const searchCep = async (cep: string): Promise<{
        logradouro: string;
        bairro: string;
        localidade: string;
        uf: string;
        cep: string;
    } | null> => {
        if (!cep || cep.length !== 8) {
            setCepError('CEP deve ter 8 dígitos');
            return null;
        }

        setIsCepLoading(true);
        setCepError(null);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                setCepError('CEP não encontrado');
                return null;
            }

            return {
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                localidade: data.localidade || '',
                uf: data.uf || '',
                cep: data.cep || cep,
            };
        } catch (err) {
            setCepError('Erro ao buscar CEP');
            return null;
        } finally {
            setIsCepLoading(false);
        }
    };

    // Função para preencher endereço automaticamente
    const handleCepSearch = async (cep: string) => {
        const addressData = await searchCep(cep);
        if (addressData) {
            const currentAddress = form.getValues('address');

            // Extrair número do endereço atual se existir
            const numberMatch = currentAddress.match(/(\d+)/);
            const number = numberMatch ? numberMatch[1] : '';

            // Construir endereço completo
            let fullAddress = addressData.logradouro;
            if (number) {
                fullAddress += `, ${number}`;
            }
            fullAddress += `, ${addressData.bairro}, ${addressData.cep}, ${addressData.localidade} - ${addressData.uf}`;

            form.setValue('address', fullAddress, { shouldValidate: true, shouldDirty: true });
            setIsAddressAutoFilled(true);

            toast({
                title: 'Endereço Preenchido!',
                description: `Endereço foi preenchido automaticamente: ${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`,
            });

            // Resetar o indicador após 3 segundos
            setTimeout(() => setIsAddressAutoFilled(false), 3000);
        } else if (cepError) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Buscar CEP',
                description: cepError,
            });
        }
    };

    // Função para extrair CEP do endereço e buscar automaticamente
    const handleAddressChange = (value: string) => {
        const cep = value.replace(/\D/g, '').slice(-8);
        if (cep.length === 8) {
            handleCepSearch(cep);
        }
    };
    
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
                alvaraInspectionDate: toDate(userProfile.alvaraInspectionDate),
                ipemInspectionDate: toDate(userProfile.ipemInspectionDate),
                licensingExpiration: toDate(userProfile.licensingExpiration),
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
        }
    }, [userProfile, loading, form]);
    
    useEffect(() => {
        const url = form.watch('photoUrl');
        return () => {
            if (typeof url === 'string' && url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [form.watch('photoUrl')]);

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
                alvaraInspectionDate: values.alvaraInspectionDate ? Timestamp.fromDate(values.alvaraInspectionDate) : null,
                ipemInspectionDate: values.ipemInspectionDate ? Timestamp.fromDate(values.ipemInspectionDate) : null,
                licensingExpiration: values.licensingExpiration ? Timestamp.fromDate(values.licensingExpiration) : null,
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

        // Validar apenas os campos da etapa atual
        const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });

        if (!isValid) {
            toast({
                variant: 'destructive',
                title: 'Campos Incompletos',
                description: 'Por favor, preencha todos os campos obrigatórios corretamente antes de avançar.',
            });
            return;
        }

        // Salvar progresso da etapa atual
        await saveCurrentStepProgress();

        // Avançar para próxima etapa
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const saveCurrentStepProgress = async () => {
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
                alvaraInspectionDate: values.alvaraInspectionDate ? Timestamp.fromDate(values.alvaraInspectionDate) : undefined,
                ipemInspectionDate: values.ipemInspectionDate ? Timestamp.fromDate(values.ipemInspectionDate) : undefined,
                licensingExpiration: values.licensingExpiration ? Timestamp.fromDate(values.licensingExpiration) : undefined,
                    reference: {
                        name: referenceName || '',
                        relationship: referenceRelationship || '',
                        phone: referencePhone || '',
                    },
                };
                
                const result = await partialUpdateUserProfile(user.uid, dataToSave);

                if (result.success) {
                toast({ title: 'Progresso Salvo!', description: 'Seus dados foram salvos com sucesso.' });
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
    };

    const handleStepNavigation = async (stepNumber: number) => {
        // Salvar progresso da etapa atual antes de navegar
        if (currentStep !== stepNumber) {
            await saveCurrentStepProgress();
        }

        // Permitir navegação livre entre etapas
        setCurrentStep(stepNumber);
    };

    const handlePrevStep = async () => {
        if (currentStep > 1) {
            // Salvar progresso antes de voltar
            await saveCurrentStepProgress();
            setCurrentStep(prev => prev - 1);
        }
    };

    // Função para verificar se uma etapa foi preenchida
    const isStepCompleted = (stepId: number): boolean => {
        const stepConfig = steps.find(s => s.id === stepId);
        if (!stepConfig) return false;

        const fieldsToCheck = stepConfig.fields as (keyof ProfileFormValues)[];
        const values = form.getValues();

        // Verificar se pelo menos um campo obrigatório da etapa foi preenchido
        return fieldsToCheck.some(field => {
            const value = values[field];
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === 'string') {
                return value.trim().length > 0;
            }
            if (typeof value === 'boolean') {
                return value === true;
            }
            if (typeof value === 'number') {
                return value > 0;
            }
            return !!value;
        });
    };

    // Função para calcular o progresso geral
    const calculateProgress = (): number => {
        const completedSteps = steps.filter(step => isStepCompleted(step.id)).length;
        return Math.round((completedSteps / totalSteps) * 100);
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
                <div className="space-y-4">
                 <Card className="p-6">
                        <Stepper
                            currentStep={currentStep}
                            onStepClick={handleStepNavigation}
                            isStepCompleted={isStepCompleted}
                        />
                </Card>

                    {/* Barra de Progresso Geral */}
                    <Card className="p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Progresso Geral</span>
                                <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${calculateProgress()}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {steps.filter(step => isStepCompleted(step.id)).length} de {totalSteps} etapas preenchidas
                            </p>
                        </div>
                    </Card>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Multi-step form for initial completion */}
                    {!isProfileComplete ? (
                        <>
                             {/* STEP 1: PERFIL & CONTATO */}
                            <div className={cn(currentStep !== 1 && "hidden")}>
                                <div className="space-y-6">
                                    {/* Seção: Foto de Perfil */}
                                    <Card className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Camera className="h-5 w-5 text-primary" />
                                                Foto de Perfil
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                Uma foto profissional aumenta significativamente suas chances de aprovação pelas frotas.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <FormItem>
                                                <div className="flex items-center justify-center">
                                                <FirebaseImageUpload
                                                    value={form.watch('photoUrl')}
                                                    onChange={url => form.setValue('photoUrl', url, { shouldValidate: true, shouldDirty: true })}
                                                    pathPrefix={`users/${user?.uid}/profile/`}
                                                />
                                            </div>
                                                <FormMessage />
                                            </FormItem>
                                        </CardContent>
                                    </Card>

                                    {/* Seção: Informações Pessoais */}
                                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <User className="h-5 w-5 text-primary" />
                                                Informações Pessoais
                                            </CardTitle>
                                            <CardDescription>
                                                Dados básicos para identificação e contato.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <FormField 
                                                control={form.control} 
                                                name="name" 
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium">Nome Completo</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                {...field} 
                                                                className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                                placeholder="Digite seu nome completo"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} 
                                            />
                                            
                                            <FormField 
                                                control={form.control} 
                                                name="bio" 
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium">Breve Resumo Sobre Você</FormLabel>
                                                        <FormControl>
                                                            <Textarea 
                                                                placeholder="Fale um pouco sobre sua experiência como motorista, seus objetivos e o que você busca." 
                                                                {...field} 
                                                                value={field.value ?? ''} 
                                                                className="min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-xs text-muted-foreground">
                                                            Máximo 300 caracteres. Seja conciso e profissional.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} 
                                            />
                                        </CardContent>
                                    </Card>

                                    {/* Seção: Contato */}
                                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <PhoneIcon className="h-5 w-5 text-primary" />
                                                Informações de Contato
                                            </CardTitle>
                                            <CardDescription>
                                                Como as frotas podem entrar em contato com você.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <FormField 
                                                    control={form.control} 
                                                    name="phone" 
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium">Telefone</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="(11) 99999-9999" 
                                                                    {...field} 
                                                                    className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} 
                                                />
                                                
                                                <FormField 
                                                    control={form.control} 
                                                    name="hasWhatsApp" 
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                                                            <div className="space-y-1">
                                                                <FormLabel className="text-sm font-medium">Este número tem WhatsApp?</FormLabel>
                                                                <FormDescription className="text-xs">
                                                                    Frotas preferem contato via WhatsApp
                                                                </FormDescription>
                                                            </div>
                                                            <FormControl>
                                                                <Switch 
                                                                    checked={field.value} 
                                                                    onCheckedChange={field.onChange}
                                                                    className="data-[state=checked]:bg-primary"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )} 
                                                />
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>
                            </div>

                             {/* STEP 2: RESIDÊNCIA E VEÍCULO */}
                             <div className={cn(currentStep !== 2 && "hidden")}>
                                <div className="space-y-6">
                                    {/* Seção: Endereço */}
                                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <HomeIcon className="h-5 w-5 text-primary" />
                                                Endereço de Residência
                                            </CardTitle>
                                            <CardDescription>
                                                Informações sobre onde você mora.
                                            </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                            <FormField control={form.control} name="address" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Endereço Completo</FormLabel>
                                                    <div className="space-y-4">
                                                        {/* Campo CEP */}
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="CEP (00000-000)"
                                                                        value={field.value ? field.value.match(/\d{5}-?\d{3}/)?.[0] || '' : ''}
                                                                        onChange={(e) => {
                                                                            const cep = e.target.value.replace(/\D/g, '');
                                                                            if (cep.length <= 8) {
                                                                                const formattedCep = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
                                                                                e.target.value = formattedCep;

                                                                                if (cep.length === 8) {
                                                                                    handleCepSearch(cep);
                                                                                }
                                                                            }
                                                                        }}
                                                                        maxLength={9}
                                                                        className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const address = form.getValues('address');
                                                                    const cep = address.replace(/\D/g, '').slice(-8);
                                                                    if (cep.length === 8) {
                                                                        handleCepSearch(cep);
                                                                    } else {
                                                                        toast({
                                                                            variant: 'destructive',
                                                                            title: 'CEP Inválido',
                                                                            description: 'Digite um CEP válido com 8 dígitos no campo CEP.',
                                                                        });
                                                                    }
                                                                }}
                                                                disabled={isCepLoading}
                                                                className="min-w-[60px] h-11"
                                                            >
                                                                {isCepLoading ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Search className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>

                                                        {/* Campo Endereço Completo */}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Rua, Número, Bairro, Cidade - Estado"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                    setIsAddressAutoFilled(false); // Resetar quando usuário editar
                                                                }}
                                                                className={cn(
                                                                    "h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                                                                    isAddressAutoFilled ? 'border-green-500 bg-green-50' : ''
                                                                )}
                                                            />
                                                        </FormControl>

                                                        {isAddressAutoFilled && (
                                                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                                                                <Check className="h-4 w-4" />
                                                                <span>Endereço preenchido automaticamente pelo CEP</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Search className="h-3 w-3" />
                                                            <span>Digite o CEP para preenchimento automático ou complete manualmente</span>
                                                        </div>
                                                    </div>
                                                    <FormDescription>Seu endereço não será público, mas é usado pelas frotas em suas análises.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        
                                        <FormField control={form.control} name="garageInfo" render={({ field }) => (
                                                <FormItem className="space-y-3 rounded-lg border p-4 bg-muted/30">
                                                    <FormLabel className="text-sm font-medium">Onde o veículo ficará guardado durante a noite?</FormLabel>
                                                    <FormDescription className="text-sm">
                                                        Frotas sérias se preocupam com a segurança do veículo. Informar que você tem um local seguro aumenta muito suas chances de aprovação.
                                                    </FormDescription>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="covered" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">Garagem Coberta</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="uncovered" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">Garagem Descoberta</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="building_garage" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">Garagem de Condomínio/Prédio</FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="none" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">Na Rua</FormLabel>
                                                            </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )} />
                                        </CardContent>
                                    </Card>

                                    {/* Seção: Modo de Trabalho */}
                                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Car className="h-5 w-5 text-primary" />
                                                Modo de Trabalho
                                            </CardTitle>
                                            <CardDescription>
                                                Como você pretende trabalhar na plataforma.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                        <FormField control={form.control} name="workMode" render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-medium">Qual seu modo de trabalho principal?</FormLabel>
                                                    <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <Label htmlFor="rental" className="flex flex-col p-4 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                                                <RadioGroupItem value="rental" id="rental" className="sr-only" />
                                                                <span className="font-bold text-lg">Alugo carro de Frota</span>
                                                                <span className="text-sm text-muted-foreground">Busco oportunidades e não preciso me preocupar com a documentação do veículo.</span>
                                                            </Label>
                                                            <Label htmlFor="owner" className="flex flex-col p-4 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                                                <RadioGroupItem value="owner" id="owner" className="sr-only" />
                                                                <span className="font-bold text-lg">Tenho meu próprio veículo</span>
                                                                <span className="text-sm text-muted-foreground">Sou proprietário(a) e quero usar a plataforma para gerenciar meus documentos.</span>
                                                            </Label>
                                                </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            
                                        {workMode === 'owner' && (
                                                <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                                                    <CardHeader className="pb-4">
                                                        <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                                                            <FileText className="h-5 w-5" />
                                                            Documentação do Veículo Próprio
                                                        </CardTitle>
                                                        <CardDescription className="text-blue-700">
                                                            Preencha os dados do seu veículo para receber lembretes de vencimento.
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                            <FormField control={form.control} name="vehicleLicensePlate" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium">Placa do Veículo (Alvará)</FormLabel>
                                                                    <FormControl>
                                                                        <Input 
                                                                            placeholder="ABC-1234" 
                                                                            {...field} 
                                                                            value={field.value ?? ''} 
                                                                            className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="alvaraExpiration" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium">Vencimento do Alvará</FormLabel>
                                                                    <FormControl>
                                                                        <DatePicker value={field.value} onChange={field.onChange} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                </div>
                                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                            <FormField control={form.control} name="alvaraInspectionDate" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium">Data da Última Vistoria do Alvará</FormLabel>
                                                                    <FormControl>
                                                                        <DatePicker value={field.value} onChange={field.onChange} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="ipemInspectionDate" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium">Data da Última Vistoria do IPEM</FormLabel>
                                                                    <FormControl>
                                                                        <DatePicker value={field.value} onChange={field.onChange} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                            </div>
                                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                            <FormField control={form.control} name="licensingExpiration" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-sm font-medium">Vencimento do Licenciamento</FormLabel>
                                                                    <FormControl>
                                                                        <DatePicker value={field.value} onChange={field.onChange} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="text-xs text-blue-700 bg-blue-100 border border-blue-200 rounded p-3">
                                                            <strong>Observação:</strong> Táxi é isento de IPVA, mas paga licenciamento anual.
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                        )}
                                    </CardContent>
                                </Card>
                                </div>
                            </div>


                            {/* STEP 3: DOCUMENTOS */}
                            <div className={cn(currentStep !== 3 && "hidden")}>
                                <Card>
                                    <CardHeader><CardTitle>Habilitação e Documentos</CardTitle><CardDescription>Mantenha seus documentos em dia para acessar as melhores oportunidades.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField control={form.control} name="cpf" render={({ field }) => (<FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="000.000.000-00" /></FormControl><FormMessage /></FormItem>)} />
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            <FormField control={form.control} name="cnhNumber" render={({ field }) => (<FormItem><FormLabel>Nº da CNH</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="cnhCategory" render={({ field }) => (<FormItem><FormLabel>Categoria CNH</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent>{['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="cnhExpiration" render={({ field }) => (<FormItem><FormLabel>Vencimento da CNH</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="cnhPoints" render={({ field }) => (<FormItem><FormLabel>Pontos na CNH</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <FormField control={form.control} name="condutaxNumber" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nº do Condutax</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value ?? ''} placeholder="Digite o número do Condutax" />
                                                    </FormControl>
                                                    <FormDescription className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                                                        💡 <strong>Dica:</strong> O Condutax é essencial! <strong>Aumenta muito suas chances de aprovação pelas frotas!</strong>
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="condutaxExpiration" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Vencimento do Condutax</FormLabel>
                                                    <FormControl>
                                                        <DatePicker value={field.value} onChange={field.onChange} />
                                                    </FormControl>
                                                    <FormDescription className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                                        ⚠️ <strong>Atenção:</strong> Mantenha sempre em dia! Vencimentos próximos podem afetar sua aprovação.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
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
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHistory(index)} className="h-7 w-7"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                                                </div>
                                                <div className="space-y-4">
                                                    <FormField control={form.control} name={`workHistory.${index}.fleetName`} render={({ field }) => (<FormItem><FormLabel>Nome da Frota</FormLabel><FormControl><Input {...field} placeholder="Ex: Frota Central" /></FormControl><FormMessage /></FormItem>)} />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField control={form.control} name={`workHistory.${index}.period`} render={({ field }) => (<FormItem><FormLabel>Período</FormLabel><FormControl><Input {...field} placeholder="Ex: 2021 - 2023" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name={`workHistory.${index}.reasonForLeaving`} render={({ field }) => (<FormItem><FormLabel>Motivo da Saída (Opcional)</FormLabel><FormControl><Input {...field} placeholder="Ex: Fim de contrato" /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <FormField control={form.control} name={`workHistory.${index}.hasOutstandingDebt`} render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Deixou alguma pendência (dívida) nesta frota?</FormLabel></div></FormItem>)} />
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
                                                    <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)) }} /></FormControl>
                                                    <FormLabel className="font-normal">{item.label}</FormLabel></FormItem>
                                                ))}</div><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="rentalPreferences.fuelTypes" render={({ field }) => (
                                            <FormItem><FormLabel>Tipos de Combustível</FormLabel><div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                                {fuelTypeOptions.map((item) => (<FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)) }} /></FormControl>
                                                    <FormLabel className="font-normal">{item.label}</FormLabel></FormItem>
                                                ))}</div><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField control={form.control} name="rentalPreferences.transmission" render={({ field }) => (
                                                <FormItem className="space-y-3"><FormLabel>Câmbio</FormLabel><FormControl>
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4">
                                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="manual" /></FormControl><FormLabel className="font-normal">Manual</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="automatic" /></FormControl><FormLabel className="font-normal">Automático</FormLabel></FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="indifferent" /></FormControl><FormLabel className="font-normal">Indiferente</FormLabel></FormItem>
                                                    </RadioGroup>
                                                </FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="rentalPreferences.maxDailyRate" render={({ field }) => (
                                                <FormItem><FormLabel>Valor Máximo da Diária (R$)</FormLabel><FormControl><Input type="number" placeholder="Ex: 150" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                            )} />
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
                                                        <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)) }} /></FormControl>
                                                        <FormLabel className="font-normal flex items-center gap-2">{item.id === 'idiomas' && <Languages />} {item.label}</FormLabel></FormItem>)} />
                                                ))}
                                            </div>
                                            <FormMessage /></FormItem>
                                        )} />
                                        {coursesWatch?.includes('idiomas') && (
                                            <FormField control={form.control} name="languageLevel" render={({ field }) => (<FormItem><FormLabel>Nível de Idioma</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o nível..." /></SelectTrigger></FormControl>
                                                <SelectContent><SelectItem value="Básico">Básico</SelectItem><SelectItem value="Intermediário">Intermediário</SelectItem><SelectItem value="Avançado">Avançado</SelectItem><SelectItem value="Fluente">Fluente</SelectItem></SelectContent>
                                            </Select><FormMessage /></FormItem>)} />
                                        )}
                                        <FormField control={form.control} name="otherCourses" render={({ field }) => (
                                            <FormItem><FormLabel className="flex items-center gap-2"><FilePlus /> Outros Cursos e Certificações</FormLabel><FormControl><Textarea placeholder="Liste outros cursos relevantes, separados por vírgula." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Referências e Termos</CardTitle><CardDescription>Informações finais para completar seu perfil.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="rounded-lg border bg-blue-500/5 border-blue-500/20 p-4">
                                            <div className="flex items-start gap-3">
                                                <BadgeInfo className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <p className="text-sm text-blue-800">Esta informação não é obrigatória, mas aumenta significativamente a confiança e as chances de aprovação do seu perfil.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <FormField control={form.control} name="referenceName" render={({ field }) => (<FormItem><FormLabel>Nome do Contato</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="referenceRelationship" render={({ field }) => (<FormItem><FormLabel>Parentesco/Relação</FormLabel><FormControl><Input placeholder="Ex: Pai, Amigo, etc." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="referencePhone" render={({ field }) => (<FormItem><FormLabel>Telefone do Contato</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
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
                                                )} />
                                            </CardContent>
                                        </Card>
                                        <FormField control={form.control} name="financialConsent" render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                <div className="space-y-1 leading-none"><FormLabel>Autorização para Análise Financeira</FormLabel><p className="text-sm text-muted-foreground">Autorizo a plataforma a realizar uma análise simplificada do meu histórico financeiro para compartilhar com as frotas.</p><FormMessage /></div>
                                            </FormItem>
                                        )} />
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
                                            <FirebaseImageUpload
                                                value={form.watch('photoUrl')}
                                                onChange={url => form.setValue('photoUrl', url, { shouldValidate: true, shouldDirty: true })}
                                                pathPrefix={`users/${user?.uid}/profile/`}
                                                label="Foto de Perfil"
                                            />
                                        </div>
                                    <FormMessage /></FormItem>
                                    <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Breve Resumo Sobre Você</FormLabel><FormControl><Textarea placeholder="Fale um pouco sobre sua experiência como motorista, seus objetivos e o que você busca." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 9..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="hasWhatsApp" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-auto"><div><FormLabel>Este número tem WhatsApp?</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                    </div>
                                </CardContent>
                            </Card>
                            {/* ... Resto do formulário completo ... */}
                            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    )}


                    {!isProfileComplete && (
                        <div className="flex items-center justify-between pt-6">
                            <div className="flex gap-2">
                                {currentStep > 1 && (
                                    <Button type="button" variant="ghost" onClick={handlePrevStep}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={saveCurrentStepProgress}
                                    disabled={isSavingStep}
                                >
                                    {isSavingStep ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileText className="mr-2 h-4 w-4" />
                                    )}
                                    Salvar Progresso
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                {currentStep < totalSteps ? (
                                    <Button type="button" onClick={handleNextStep} disabled={isSavingStep}>
                                        {isSavingStep && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Próximo <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="mr-2 h-4 w-4" />
                                        )}
                                        Finalizar Cadastro
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </Form>

            <Dialog open={false} onOpenChange={() => { }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cortar Imagem</DialogTitle>
                        <DialogDescription>
                            Ajuste a imagem para o seu perfil. Use uma proporção quadrada.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Removed ReactCrop component as it's no longer needed for local cropping */}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { }}>Cancelar</Button>
                        <Button onClick={() => { }}>Salvar Foto</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
