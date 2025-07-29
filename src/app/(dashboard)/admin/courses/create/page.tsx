
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createCourse } from '@/app/actions/course-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Eye, EyeOff, ImageIcon, Check, X, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema para o formulário de criação inicial
const courseCreationSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.' }).optional(),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }).optional(),
  category: z.string().min(3, { message: 'A categoria é obrigatória.' }).optional(),
  targetAudience: z.string().optional().or(z.literal('')),
  difficulty: z.enum(['Iniciante', 'Intermediário', 'Avançado']).default('Iniciante'),
  estimatedDuration: z.coerce.number().min(1, "A duração estimada deve ser de pelo menos 1 minuto.").default(60),
  coverImageUrl: z.string().url('A capa deve ser uma URL válida.').optional().or(z.literal('')),
  
  // Tipo de contrato
  contractType: z.enum(['own_content', 'partner_content']).default('own_content'),
  saleValue: z.coerce.number().min(0).default(0),
  
  // Controle financeiro
  courseType: z.enum(['own_course', 'partner_course']).default('own_course'),
  partnerName: z.string().optional().or(z.literal('')),
  paymentType: z.enum(['fixed', 'percentage', 'free', 'exchange']).optional(),
  contractStatus: z.enum(['negotiating', 'signed', 'expired']).optional(),
  investmentCost: z.coerce.number().min(0).default(0).optional(),
  
  // Configurações
  isPublicListing: z.boolean().default(false),
  enableComments: z.boolean().default(true),
  autoCertification: z.boolean().default(true),
  minimumPassingScore: z.coerce.number().min(0).max(100).default(70),
  
  // SEO
  seoTags: z.string().optional().or(z.literal('')), // Será convertido para array
});

type CourseCreationFormValues = z.infer<typeof courseCreationSchema>;

// Função para limpar dados do formulário
function cleanFormData(data: CourseCreationFormValues) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === '') {
            cleaned[key] = null;
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

// Função para validar se uma etapa está completa
function validateStep(step: number, values: Partial<CourseCreationFormValues>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Garantir que values não seja undefined
    if (!values) {
        return { isValid: false, errors: ['Dados do formulário não encontrados'] };
    }
    
    switch (step) {
        case 1:
            if (!values.title || values.title.length < 5) {
                errors.push('Título deve ter pelo menos 5 caracteres');
            }
            if (!values.category) {
                errors.push('Categoria é obrigatória');
            }
            if (!values.description || values.description.length < 20) {
                errors.push('Descrição deve ter pelo menos 20 caracteres');
            }
            if (!values.estimatedDuration || values.estimatedDuration < 1) {
                errors.push('Duração estimada deve ser de pelo menos 1 minuto');
            }
            break;
            
        case 2:
            if (!values.contractType) {
                errors.push('Tipo de conteúdo é obrigatório');
            }
            if (values.courseType === 'partner_course' && !values.partnerName) {
                errors.push('Nome do parceiro é obrigatório para cursos de parceiro');
            }
            break;
            
        case 3:
            if (values.minimumPassingScore !== undefined && (values.minimumPassingScore < 0 || values.minimumPassingScore > 100)) {
                errors.push('Nota mínima deve estar entre 0% e 100%');
            }
            break;
    }
    
    return { isValid: errors.length === 0, errors };
}

export default function CreateCoursePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [stepErrors, setStepErrors] = useState<string[]>([]);
    const totalSteps = 3;

    const form = useForm<CourseCreationFormValues>({
        resolver: zodResolver(courseCreationSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            targetAudience: '',
            difficulty: 'Iniciante',
            estimatedDuration: 60,
            coverImageUrl: '',
            contractType: 'own_content',
            saleValue: 0,
            courseType: 'own_course',
            partnerName: '',
            paymentType: 'fixed',
            contractStatus: 'negotiating',
            investmentCost: 0,
            isPublicListing: false,
            enableComments: true,
            autoCertification: true,
            minimumPassingScore: 70,
            seoTags: '',
        },
        mode: 'onChange', // Validação em tempo real
    });

    // Auto-save: salvar no localStorage
    useEffect(() => {
        const saved = localStorage.getItem('courseDraft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                form.reset(parsed);
            } catch (error) {
                console.error('Erro ao carregar rascunho:', error);
            }
        }
    }, [form]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            localStorage.setItem('courseDraft', JSON.stringify(value));
            
            // Validar etapa atual em tempo real
            const validation = validateStep(currentStep, value || {});
            setStepErrors(validation.errors);
        });
        return () => subscription.unsubscribe();
    }, [form, currentStep]);

    // Validar etapa atual quando mudar
    useEffect(() => {
        const values = form.getValues();
        const validation = validateStep(currentStep, values || {});
        setStepErrors(validation.errors);
    }, [currentStep, form]);

    const onSubmit = async (values: CourseCreationFormValues) => {
        setIsSubmitting(true);
        try {
            // Validar todas as etapas antes de enviar
            const allErrors: string[] = [];
            for (let step = 1; step <= totalSteps; step++) {
                const validation = validateStep(step, values || {});
                allErrors.push(...validation.errors);
            }
            
            if (allErrors.length > 0) {
                throw new Error(`Erros de validação: ${allErrors.join(', ')}`);
            }

            // Converter tags de string para array
            const seoTagsArray = values.seoTags ? values.seoTags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            // Limpar dados antes de enviar - remover campos undefined
            const cleanedValues = cleanFormData(values);
            const courseData = {
                ...cleanedValues,
                seoTags: seoTagsArray,
            };

            const result = await createCourse(courseData);

            if (result.success && result.courseId) {
                // Limpar rascunho após sucesso
                localStorage.removeItem('courseDraft');
                
                toast({ 
                    title: 'Curso Criado com Sucesso!', 
                    description: 'Agora adicione os módulos e aulas.' 
                });
                router.push(`/admin/courses/${result.courseId}/edit`);
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error("Error creating course shell: ", error);
            toast({ 
                variant: 'destructive', 
                title: 'Erro ao Criar Curso', 
                description: (error as Error).message 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = useCallback(() => {
        const values = form.getValues();
        const validation = validateStep(currentStep, values || {});
        
        if (!validation.isValid) {
            setStepErrors(validation.errors);
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: `Por favor, corrija os seguintes erros: ${validation.errors.join(', ')}`
            });
            return;
        }
        
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            setStepErrors([]);
        }
    }, [currentStep, totalSteps, form, toast]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setStepErrors([]);
        }
    }, [currentStep]);

    // Função para lidar com upload de imagem
    const handleImageUpload = useCallback((field: any) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Validar tamanho do arquivo (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast({
                        variant: 'destructive',
                        title: 'Arquivo muito grande',
                        description: 'A imagem deve ter no máximo 5MB'
                    });
                    return;
                }
                
                // Validar tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    toast({
                        variant: 'destructive',
                        title: 'Tipo de arquivo inválido',
                        description: 'Por favor, selecione apenas imagens'
                    });
                    return;
                }
                
                // Aqui você pode implementar o upload para Firebase Storage
                // Por enquanto, vamos simular criando uma URL local
                const url = URL.createObjectURL(file);
                field.onChange(url);
                setImageError(false);
                setIsImageLoading(false);
                
                toast({
                    title: 'Imagem carregada',
                    description: 'Imagem carregada com sucesso!'
                });
            }
        };
        input.click();
    }, [toast]);

    const renderStep1 = () => (
        <Card>
            <CardHeader>
                <CardTitle>Informações Gerais do Curso</CardTitle>
                <CardDescription>Configure as informações básicas do curso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {stepErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                {stepErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
                
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Título do Curso *</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Ex: Direção Defensiva Avançada" />
                        </FormControl>
                        <FormDescription>Escolha um título claro e objetivo. Evite títulos genéricos.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Atendimento">Atendimento</SelectItem>
                                    <SelectItem value="Segurança">Segurança</SelectItem>
                                    <SelectItem value="Turismo">Turismo</SelectItem>
                                    <SelectItem value="Mecânica">Mecânica</SelectItem>
                                    <SelectItem value="Legislação">Legislação</SelectItem>
                                    <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                                    <SelectItem value="Gestão">Gestão</SelectItem>
                                    <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormDescription>Defina a área principal do curso.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descrição do Curso *</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Descreva o objetivo principal do curso e o que o aluno vai aprender." rows={4} />
                        </FormControl>
                        <FormDescription>Explique em detalhes o que o aluno vai aprender.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="targetAudience" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Público-alvo</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Ex: Motoristas iniciantes, Motoristas experientes" />
                        </FormControl>
                        <FormDescription>Defina quem é o público ideal para este curso.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="difficulty" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nível de Dificuldade</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} value={field.value || 'Iniciante'}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                                        <SelectItem value="Avançado">Avançado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    
                    <FormField control={form.control} name="estimatedDuration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duração Estimada (minutos)</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    type="number" 
                                    placeholder="120" 
                                    min="1"
                                    value={field.value === 0 ? '' : field.value || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '') {
                                            field.onChange(0);
                                        } else {
                                            const numValue = parseInt(value);
                                            if (isNaN(numValue) || numValue < 1) {
                                                field.onChange(1);
                                            } else {
                                                field.onChange(numValue);
                                            }
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                Tempo total estimado para completar o curso (mínimo 1 minuto).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                
                <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-semibold">🖼️ Capa do Curso</FormLabel>
                        <FormControl>
                            <div className="space-y-4">
                                {/* Opções de upload */}
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <Input 
                                            {...field} 
                                            placeholder="Cole a URL da imagem de capa aqui..." 
                                            className={`pr-10 ${imageError ? 'border-red-300 focus:border-red-500' : ''}`}
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                field.onChange(url);
                                                
                                                // Reset states when URL changes
                                                setImageError(false);
                                                
                                                // Show loading if URL looks valid
                                                if (url && url.startsWith('http')) {
                                                    setIsImageLoading(true);
                                                } else {
                                                    setIsImageLoading(false);
                                                }
                                            }}
                                        />
                                        {/* Status indicator */}
                                        {field.value && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                {isImageLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                                ) : imageError ? (
                                                    <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                                                        <X className="h-3 w-3 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => handleImageUpload(field)}
                                        title="Fazer upload de nova imagem"
                                    >
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Preview da imagem */}
                                {field.value && (
                                    <div className="relative">
                                        {/* Loading state */}
                                        {isImageLoading && (
                                            <div className="bg-gray-100 rounded-lg w-full max-w-xs h-40 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
                                                    <p className="text-sm text-gray-600">Carregando imagem...</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Image preview */}
                                        <img 
                                            src={field.value} 
                                            alt="Preview da capa" 
                                            className={`rounded-lg shadow-md w-full max-w-xs h-40 object-cover border-2 transition-all ${
                                                isImageLoading ? 'hidden' : 'border-gray-200'
                                            } ${imageError ? 'border-red-300' : ''}`}
                                            onLoad={() => {
                                                setIsImageLoading(false);
                                                setImageError(false);
                                            }}
                                            onError={() => {
                                                setIsImageLoading(false);
                                                setImageError(true);
                                            }}
                                        />
                                        
                                        {/* Error state */}
                                        {imageError && !isImageLoading && (
                                            <div className="bg-red-50 rounded-lg w-full max-w-xs h-40 flex items-center justify-center border-2 border-red-200">
                                                <div className="text-center">
                                                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-red-400" />
                                                    <p className="text-sm text-red-600 font-medium">Imagem não encontrada</p>
                                                    <p className="text-xs text-red-500">Verifique se a URL está correta</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Botão para remover */}
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 h-6 w-6 p-0"
                                            onClick={() => {
                                                field.onChange('');
                                                setImageError(false);
                                                setIsImageLoading(false);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}

                                {/* Galeria de imagens sugeridas */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium mb-3 text-gray-700">💡 Imagens Sugeridas</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop',
                                            'https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop',
                                            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop'
                                        ].map((url, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => field.onChange(url)}
                                                className="relative group overflow-hidden rounded-md border-2 border-transparent hover:border-blue-300 transition-all"
                                            >
                                                <img 
                                                    src={url} 
                                                    alt={`Sugestão ${index + 1}`}
                                                    className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Imagens Recentes (simulado) */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-medium mb-3 text-blue-700">📁 Imagens Recentes</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=100&fit=crop',
                                            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&h=100&fit=crop',
                                            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=100&fit=crop',
                                            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&h=100&fit=crop'
                                        ].map((url, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => field.onChange(url)}
                                                className="relative group overflow-hidden rounded-md border-2 border-transparent hover:border-blue-400 transition-all"
                                                title="Clique para usar esta imagem"
                                            >
                                                <img 
                                                    src={url} 
                                                    alt={`Recente ${index + 1}`}
                                                    className="w-full h-12 object-cover group-hover:scale-105 transition-transform"
                                                />
                                                <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                        💡 Estas são imagens que você usou recentemente em outros cursos
                                    </p>
                                </div>
                            </div>
                        </FormControl>
                        <FormDescription>
                            Escolha uma imagem de capa para destacar seu curso. Você pode colar uma URL ou fazer upload de uma nova imagem.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
            </CardContent>
        </Card>
    );

    const renderStep2 = () => (
        <Card>
            <CardHeader>
                <CardTitle>Tipo de Conteúdo e Contrato</CardTitle>
                <CardDescription>Configure o tipo de conteúdo e informações contratuais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {stepErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                {stepErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
                
                <FormField control={form.control} name="contractType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Conteúdo</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value || 'own_content'} className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="own_content" id="own_content" />
                                    <Label htmlFor="own_content">Conteúdo próprio (IA ou você mesmo criou)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="partner_content" id="partner_content" />
                                    <Label htmlFor="partner_content">Conteúdo de parceiro contratado</Label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="saleValue" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valor de Venda (R$)</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                type="number" 
                                placeholder="0.00" 
                                step="0.01" 
                                min="0"
                                value={field.value === 0 ? '' : field.value || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        field.onChange(0);
                                    } else {
                                        const numValue = parseFloat(value);
                                        field.onChange(isNaN(numValue) ? 0 : numValue);
                                    }
                                }}
                            />
                        </FormControl>
                        <FormDescription>
                            Valor de venda do curso. Deixe em branco ou 0 para cursos gratuitos.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="isPublicListing" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Inserir este curso na listagem pública de cursos recomendados aos taxistas</FormLabel>
                            <FormDescription>
                                Marque esta opção para que o curso apareça nas recomendações públicas.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}/>
                
                <Separator />
                
                <FormField control={form.control} name="courseType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Curso (Controle Financeiro)</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value || 'own_course'} className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="own_course" id="own_course" />
                                    <Label htmlFor="own_course">Curso próprio (sem custo)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="partner_course" id="partner_course" />
                                    <Label htmlFor="partner_course">Curso de parceiro com contrato</Label>
                                </div>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                {form.watch('courseType') === 'partner_course' && (
                    <>
                        <FormField control={form.control} name="partnerName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Professor/Parceiro *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nome do parceiro" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="paymentType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Forma de Pagamento</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value || 'fixed'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a forma de pagamento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">Valor fixo</SelectItem>
                                            <SelectItem value="percentage">Porcentagem de vendas</SelectItem>
                                            <SelectItem value="free">Gratuito</SelectItem>
                                            <SelectItem value="exchange">Permuta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="contractStatus" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status do Contrato</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value || 'negotiating'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="negotiating">Em negociação</SelectItem>
                                            <SelectItem value="signed">Assinado</SelectItem>
                                            <SelectItem value="expired">Vencido</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="investmentCost" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor Investido (R$)</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="number" 
                                        placeholder="0.00" 
                                        step="0.01" 
                                        min="0"
                                        value={field.value === 0 ? '' : field.value || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                field.onChange(0);
                                            } else {
                                                const numValue = parseFloat(value);
                                                field.onChange(isNaN(numValue) ? 0 : numValue);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Valor investido na criação ou aquisição do curso. Deixe em branco ou 0 se não houver custo.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </>
                )}
            </CardContent>
        </Card>
    );

    const renderStep3 = () => (
        <Card>
            <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>Configure avaliações, certificação e SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {stepErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc list-inside">
                                {stepErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="enableComments" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value || true}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Ativar comentários dos alunos</FormLabel>
                                <FormDescription>
                                    Permite que os alunos deixem comentários nas aulas.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}/>
                    
                    <FormField control={form.control} name="autoCertification" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value || true}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Certificação automática</FormLabel>
                                <FormDescription>
                                    Emite certificado automaticamente ao completar o curso.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}/>
                </div>
                
                <FormField control={form.control} name="minimumPassingScore" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nota Mínima para Aprovação (%)</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                max="100" 
                                placeholder="70" 
                                value={field.value === 70 ? '' : field.value || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        field.onChange(70);
                                    } else {
                                        const numValue = parseInt(value);
                                        if (isNaN(numValue)) {
                                            field.onChange(70);
                                        } else if (numValue < 0) {
                                            field.onChange(0);
                                        } else if (numValue > 100) {
                                            field.onChange(100);
                                        } else {
                                            field.onChange(numValue);
                                        }
                                    }
                                }}
                            />
                        </FormControl>
                        <FormDescription>
                            Nota mínima necessária para aprovação no curso (0-100%). Padrão: 70%.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <FormField control={form.control} name="seoTags" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tags para SEO</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="taxi, direção, segurança, sp" />
                        </FormControl>
                        <FormDescription>Separe as tags por vírgula. Ex: taxi, direção, segurança, sp</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}/>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Próximos Passos</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Adicionar módulos e aulas</li>
                        <li>• Configurar exercícios e avaliações</li>
                        <li>• Upload de materiais complementares</li>
                        <li>• Configurar certificação</li>
                        <li>• Revisar e publicar</li>
                    </ul>
                </div>

                {/* Resumo dos valores configurados */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-900">📋 Resumo da Configuração</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">💰 Valor de Venda:</span>
                                    <span className="text-blue-700">
                                        {form.watch('saleValue') === 0 ? 'Gratuito' : `R$ ${form.watch('saleValue')?.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">💸 Valor Investido:</span>
                                    <span className="text-blue-700">
                                        {form.watch('investmentCost') === 0 ? 'Sem custo' : `R$ ${form.watch('investmentCost')?.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">⏱️ Duração Estimada:</span>
                                    <span className="text-blue-700">
                                        {form.watch('estimatedDuration') || 60} minutos
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">📊 Nota Mínima:</span>
                                    <span className="text-blue-700">
                                        {form.watch('minimumPassingScore') || 70}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">📝 Comentários:</span>
                                    <span className="text-blue-700">
                                        {form.watch('enableComments') ? 'Ativados' : 'Desativados'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">🏆 Certificação:</span>
                                    <span className="text-blue-700">
                                        {form.watch('autoCertification') ? 'Automática' : 'Manual'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return renderStep1();
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div className="space-y-4">
                    <Progress value={(currentStep / totalSteps) * 100} className="mb-4" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-headline text-3xl font-bold tracking-tight">
                                Criar Novo Curso (Etapa {currentStep} de {totalSteps})
                            </h1>
                            <p className="text-muted-foreground">
                                {currentStep === 1 && "Configure as informações básicas do curso"}
                                {currentStep === 2 && "Defina o tipo de conteúdo e contrato"}
                                {currentStep === 3 && "Configure avaliações e SEO"}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {currentStep > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    Anterior
                                </Button>
                            )}
                            {currentStep < totalSteps && (
                                <Button 
                                    type="button" 
                                    onClick={nextStep}
                                    disabled={stepErrors.length > 0}
                                >
                                    Próximo
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {renderCurrentStep()}

                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                        {stepErrors.length > 0 && (
                            <span className="text-red-600">
                                ⚠️ Corrija os erros antes de continuar
                            </span>
                        )}
                    </div>
                    
                    {currentStep === totalSteps ? (
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || stepErrors.length > 0} 
                            size="lg"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Salvando...' : 'Criar Curso e Ir para o Construtor'}
                        </Button>
                    ) : (
                        <Button 
                            type="button" 
                            onClick={nextStep} 
                            size="lg"
                            disabled={stepErrors.length > 0}
                        >
                            Próximo Passo
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
