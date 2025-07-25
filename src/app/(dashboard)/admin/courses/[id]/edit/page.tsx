'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { use } from 'react';

import { type Course } from '@/lib/types';
import { getCourseById, updateCourse } from '@/app/actions/course-actions';
import { courseFormSchema, type CourseFormValues } from '@/lib/course-schemas';
import { LoadingScreen } from '@/components/loading-screen';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, PlusCircle, Trash2, Sparkles, FileText, Video, ClipboardCheck, GripVertical, Paperclip, Percent, AlertTriangle, Mic, DollarSign, Copyright, Gavel, CreditCard, BarChart, Trophy, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ContentBlocksEditor } from '@/components/course/ContentBlocksEditor';
import { Controller } from 'react-hook-form';
import { Progress } from '@/components/ui/progress';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

// Definições globais de tipos literais
export type PageType = "video" | "text" | "file";
export type LessonTypeLiteral = "video" | "text" | "quiz" | "audio";
export const validPageTypes: PageType[] = ["video", "text", "file"];
export const validLessonTypes: LessonTypeLiteral[] = ["video", "text", "quiz", "audio"];

const lessonTypeIcons: { [key: string]: React.ReactNode } = {
    video: <Video className="h-4 w-4" />,
    text: <FileText className="h-4 w-4" />,
    quiz: <ClipboardCheck className="h-4 w-4" />,
    audio: <Mic className="h-4 w-4" />,
};

// Guia de Markdown Avançado
const advancedMarkdownGuide = `
# Título Principal
## Subtítulo

**Negrito**, *itálico*, ~~riscado~~, [link](https://taxiandosp.vercel.app)

- Lista não ordenada
- Outro item

1. Lista ordenada
2. Segundo item

> Citação de destaque

| Tabela | Exemplo |
| ------ | ------- |
| Celula | Celula  |

![Imagem Exemplo](https://placehold.co/400x200)

<p align="center">Alinhamento centralizado (simulado com HTML)</p>
`;

function MarkdownAdvancedGuideModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="mb-2">Guia de Markdown Avançado</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Guia de Markdown Avançado</DialogTitle>
                    <DialogDescription>
                        Exemplos de formatação, listas, imagens, tabelas, citações e alinhamento.
                    </DialogDescription>
                </DialogHeader>
                <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{advancedMarkdownGuide}</ReactMarkdown>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Fechar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function InsertImageButton({ onInsert }: { onInsert: (markdown: string) => void }) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [desc, setDesc] = useState('');
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="mb-2 ml-2">Inserir Imagem</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Inserir Imagem</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Input placeholder="URL da imagem" value={url} onChange={e => setUrl(e.target.value)} />
                    <Input placeholder="Descrição (alt)" value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button onClick={() => { onInsert(`![${desc}](${url})`); setOpen(false); setUrl(''); setDesc(''); }} disabled={!url}>Inserir</Button>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [initialModuleCount, setInitialModuleCount] = useState(0);
    const [formKey, setFormKey] = useState(0);
    const [initialData, setInitialData] = useState<CourseFormValues | null>(null);

    function safeReset(data: CourseFormValues) {
        setInitialData(data);
        setFormKey(k => k + 1);
    }

    useEffect(() => {
        if (id) {
            getCourseById(id).then(data => {
                if (data) {
                    // Normalização de dados vindos do backend
                    // Definições globais de tipos literais
                    const normalized = {
                        ...data,
                        difficulty: (data.difficulty === 'Iniciante' || data.difficulty === 'Intermediário' || data.difficulty === 'Avançado') ? data.difficulty : 'Iniciante',
                        modules: (data.modules ?? []).map(function (m: any) {
                            return {
                                id: m.id || nanoid(),
                                title: m.title || '',
                                lessons: (m.lessons ?? []).map(function (lesson: any) {
                                    return {
                                        id: lesson.id || nanoid(),
                                        title: lesson.title || '',
                                        summary: lesson.summary || '',
                                        type: validLessonTypes.includes(lesson.type) ? lesson.type as LessonTypeLiteral : 'text' as LessonTypeLiteral,
                                        duration: lesson.duration ?? 10,
                                        pages: (lesson.pages ?? []).map(function (page: any) {
                                            return {
                                                id: page.id || nanoid(),
                                                type: validPageTypes.includes(page.type) ? page.type as PageType : 'text' as PageType,
                                                title: page.title || '',
                                                textContent: page.textContent || '',
                                                videoUrl: page.videoUrl || '',
                                                files: Array.isArray(page.files) ? page.files : [],
                                            };
                                        }),
                                        questions: (lesson.questions ?? []).map(function (q: any) {
                                            return {
                                                ...q,
                                                id: q.id || nanoid(),
                                                options: (q.options ?? []).map(function (o: any) {
                                                    return { ...o, id: o.id || nanoid() };
                                                })
                                            };
                                        }),
                                    };
                                }),
                                badge: m.badge ? { name: m.badge?.name || '' } : undefined,
                            };
                        }),
                    };
                    safeReset(normalized);
                    setIsPublished(data.status === 'Published');
                    setInitialModuleCount((data.modules ?? []).length || 0);
                }
                setIsLoadingData(false);
            });
        }
    }, [id]);

    // Auto-save: salvar no localStorage
    useEffect(() => {
        const saved = localStorage.getItem('courseEditDraft-' + id);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Garante que todos os módulos, aulas, questões e opções tenham id único
                // Definições globais de tipos literais
                const normalized = {
                    ...parsed,
                    modules: (parsed.modules ?? []).map(function (m: any) {
                        return {
                            ...m,
                            id: m.id || nanoid(),
                            lessons: (m.lessons ?? []).map(function (lesson: any) {
                                return {
                                    ...lesson,
                                    id: lesson.id || nanoid(),
                                    summary: lesson.summary || '',
                                    pages: (lesson.pages ?? []).map(function (page: any) {
                                        return {
                                            ...page,
                                            id: page.id || nanoid(),
                                            type: validPageTypes.includes(page.type) ? page.type as PageType : 'text' as PageType,
                                            title: page.title || '',
                                            textContent: page.textContent || '',
                                            videoUrl: page.videoUrl || '',
                                            files: (page.files ?? []).map(function (f: any) {
                                                return {
                                                    ...f,
                                                    id: f.id || nanoid(),
                                                    url: f.url || '',
                                                };
                                            })
                                        };
                                    }),
                                    questions: (lesson.questions ?? []).map(function (q: any) {
                                        return {
                                            ...q,
                                            id: q.id || nanoid(),
                                            options: (q.options ?? []).map(function (o: any) {
                                                return { ...o, id: o.id || nanoid() };
                                            })
                                        };
                                    })
                                };
                            }),
                            badge: m.badge ? { name: m.badge?.name || '' } : undefined
                        };
                    }),
                };
                safeReset(normalized);
            } catch (e) {
                // Se der erro no parse, ignora o draft
            }
        }
    }, [id]);

    if (isLoadingData || !initialData) { return <LoadingScreen />; }

    return (
        <EditCourseForm
            key={formKey}
            initialData={initialData}
            isPublished={isPublished}
            initialModuleCount={initialModuleCount}
            user={user}
            router={router}
            setIsSubmitting={setIsSubmitting}
            isSubmitting={isSubmitting}
            courseId={id}
        />
    );
}

// Novo componente filho
function EditCourseForm({ initialData, isPublished, initialModuleCount, user, router, setIsSubmitting, isSubmitting, courseId }: {
    initialData: CourseFormValues,
    isPublished: boolean,
    initialModuleCount: number,
    user: any,
    router: any,
    setIsSubmitting: (b: boolean) => void,
    isSubmitting: boolean,
    courseId: string,
}) {
    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: initialData,
    });

    const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
        control: form.control, name: 'modules',
    });

    // 1. Estados para loading e dirty
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    // 2. Detecta alterações não salvas
    useEffect(() => {
      const subscription = form.watch(() => setHasUnsavedChanges(true));
      return () => subscription.unsubscribe();
    }, [form]);

    // 3. Confirmação de saída se houver alterações não salvas
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
          e.preventDefault();
          e.returnValue = '';
        }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // 4. Scroll para o primeiro erro ao salvar
    const scrollToFirstError = (errors: any) => {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const el = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
        if (el) {
          (el as HTMLElement).focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    // 5. Submit handler com loading, toast, logs e scroll para erro
    const onSubmit = async (values: any, e?: React.BaseSyntheticEvent) => {
      setIsSaving(true);
      setHasUnsavedChanges(false);
      console.log('Salvando curso...', values);
      try {
        await updateCourse(courseId, values, user.uid);
        toast({ title: 'Sucesso', description: 'Curso salvo com sucesso!' });
        console.log('Curso salvo com sucesso!');
        // Type guard seguro para submitter:
        const submitter = (e?.nativeEvent && typeof (e.nativeEvent as any).submitter === 'object') ? (e.nativeEvent as any).submitter : null;
        if (submitter?.name === 'saveAndExit') {
          window.location.href = '/admin/courses';
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Falha ao salvar curso.' });
        console.error('Erro ao salvar curso:', error);
        if (form.formState.errors) scrollToFirstError(form.formState.errors);
      } finally {
        setIsSaving(false);
      }
    };

    // 6. Cards destacados e espaçamento
    // Adicione classes: shadow-lg, border-primary/30, rounded-xl, p-6, mb-8 aos Cards principais
    // Exemplo:
    // <Card className="shadow-lg border-primary/30 rounded-xl p-6 mb-8">
    // ...
    // </Card>

    // 7. Indicação de campos obrigatórios
    // Adicione <span className="text-red-500 ml-1">*</span> nos FormLabel dos campos obrigatórios
    // Exemplo:
    // <FormLabel>Nome do Curso <span className="text-red-500 ml-1">*</span></FormLabel>

    // 8. Responsividade e foco visual em erro
    // Adicione classes responsive (p-4 md:p-6), e para erro: border-red-500 focus-visible:ring-red-500
    // Exemplo:
    // <Input {...field} className={cn(fieldState.error && 'border-red-500 focus-visible:ring-red-500', '...outras classes')}/>

    // 9. Botões de salvar
    // Substitua o botão de submit por:
    // <div className="flex gap-4 mt-8">
    //   <Button type="submit" disabled={isSaving} name="saveAndContinue">
    //     {isSaving ? <SpinnerIcon className="animate-spin mr-2 h-4 w-4" /> : null}
    //     Salvar e Continuar Editando
    //   </Button>
    //   <Button type="submit" variant="secondary" disabled={isSaving} name="saveAndExit">
    //     {isSaving ? <SpinnerIcon className="animate-spin mr-2 h-4 w-4" /> : null}
    //     Salvar e Sair
    //   </Button>
    // </div>

    // Pré-visualização do curso
    const [showPreview, setShowPreview] = useState(false);

    return (
        <Form {...form} key={courseId}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <Progress value={100} className="mb-4" />
                <div className="flex justify-between items-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414a1 1 0 01-1.263-1.263l1.414-4.243a4 4 0 01.828-1.414z" /></svg>
                        Editar Curso
                    </h1>
                    <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Fechar Pré-visualização' : 'Pré-visualizar Curso'}</Button>
                </div>
                {showPreview && (
                    <Card className="mb-4">
                        <CardHeader><CardTitle>Pré-visualização</CardTitle></CardHeader>
                        <CardContent>
                            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(form.getValues(), null, 2)}</pre>
                        </CardContent>
                    </Card>
                )}

                {isPublished && (
                    <Card className="border-amber-500/50 bg-amber-500/5">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                            <div>
                                <CardTitle className="text-amber-900">Modo de Edição Limitada</CardTitle>
                                <CardDescription className="text-amber-800">Este curso já foi publicado. Para proteger a experiência dos alunos, você só pode adicionar novos módulos ou aulas. As edições e remoções de conteúdo existente estão desativadas.</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                )}

                <Card className="shadow-lg border-primary/30 rounded-xl p-6 mb-8">
                    <CardHeader><h2 className="text-xl font-bold">Informações Gerais do Curso</h2></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capa do Curso</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // Simulação: gerar URL local (substitua por upload real se necessário)
                                            const url = URL.createObjectURL(file);
                                            field.onChange(url);
                                        }
                                    }} />
                                </FormControl>
                                {form.watch("coverImageUrl") && (
                                    <img src={form.watch("coverImageUrl") as string} alt="Preview da capa" className="mt-2 rounded-lg shadow w-full max-w-xs h-32 object-cover" />
                                )}
                                <FormDescription>Escolha uma imagem de capa para destacar seu curso.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título do Curso <span className="text-red-500 ml-1">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Direção Defensiva Avançada" disabled={isPublished} className={`${form.formState.errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                </FormControl>
                                <FormDescription>
                                    Um título conciso e atraente para o curso.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria <span className="text-red-500 ml-1">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Segurança, Atendimento" disabled={isPublished} className={`${form.formState.errors.category ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                </FormControl>
                                <FormDescription>
                                    Defina a categoria principal do curso para organização.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição Curta <span className="text-red-500 ml-1">*</span></FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Descreva o objetivo principal do curso." disabled={isPublished} className={`${form.formState.errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                </FormControl>
                                <FormDescription>
                                    Forneça uma breve descrição do que o curso oferece.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-primary/30 rounded-xl p-6 mb-8">
                    <CardHeader><h2 className="text-xl font-bold">Informações Financeiras, Legais e de Nível</h2></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="difficulty" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Trophy /> Nível de Dificuldade <span className="text-red-500 ml-1">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={form.formState.errors.difficulty ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                                            <SelectValue placeholder="Selecione o nível..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Iniciante"><div className="flex items-center gap-2"><BarChart /> Iniciante</div></SelectItem>
                                        <SelectItem value="Intermediário"><div className="flex items-center gap-2"><BrainCircuit /> Intermediário</div></SelectItem>
                                        <SelectItem value="Avançado"><div className="flex items-center gap-2"><Trophy /> Avançado</div></SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Defina o nível de dificuldade para ajudar os alunos a escolherem o curso certo.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                            <FormField control={form.control} name="investmentCost" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><DollarSign /> Custo de Investimento (R$) <span className="text-red-500 ml-1">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder="Ex: 500.00" className={`${form.formState.errors.investmentCost ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                    </FormControl>
                                    <FormDescription>
                                        Valor gasto na produção ou compra deste curso.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="priceInCredits" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><CreditCard /> Preço em Créditos <span className="text-red-500 ml-1">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder="Ex: 10" className={`${form.formState.errors.priceInCredits ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                    </FormControl>
                                    <FormDescription>
                                        Custo para o usuário comprar o curso. Deixe 0 para gratuito.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="border-t pt-6 space-y-6">
                            <FormField control={form.control} name="authorInfo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><Copyright /> Informações de Direitos Autorais <span className="text-red-500 ml-1">*</span></FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ex: © 2024 Nome do Produtor Terceirizado" className={`${form.formState.errors.authorInfo ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                    </FormControl>
                                    <FormDescription>
                                        Caso o conteúdo seja de terceiros, informe aqui.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="legalNotice" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><Gavel /> Aviso Legal sobre Reprodução <span className="text-red-500 ml-1">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Ex: A reprodução deste conteúdo é proibida..." rows={3} className={`${form.formState.errors.legalNotice ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                    </FormControl>
                                    <FormDescription>
                                        Este aviso será exibido aos alunos ao acessarem as aulas.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>


                <div>
                    <h2 className="text-2xl font-bold font-headline">Estrutura do Curso</h2>
                    <p className="text-muted-foreground">Adicione ou edite módulos e aulas para montar o conteúdo.</p>
                </div>

                <Accordion type="multiple" className="w-full space-y-4" defaultValue={moduleFields.map((_, i) => `module-${i}`)}>
                    {moduleFields.map((moduleItem, moduleIndex) => {
                        const isExistingModule = moduleIndex < initialModuleCount;
                        const isEditingDisabled = isPublished && isExistingModule;
                        return (
                            <ModuleField
                                key={moduleItem.id}
                                moduleIndex={moduleIndex}
                                moduleId={moduleItem.id}
                                removeModule={removeModule}
                                form={form}
                                isEditingDisabled={isEditingDisabled}
                                isPublished={isPublished}
                                initialModuleCount={initialModuleCount}
                            />
                        );
                    })}
                </Accordion>

                {form.formState.errors.modules?.root && (<p className="text-sm font-medium text-destructive">{form.formState.errors.modules.root.message}</p>)}

                <div className="flex justify-between items-center mt-4">
                    <Button type="button" variant="outline" onClick={() => appendModule({
                        id: nanoid(),
                        title: '',
                        lessons: [
                            {
                                id: nanoid(),
                                title: '',
                                summary: '',
                                type: 'text' as LessonTypeLiteral,
                                duration: 10,
                                pages: [{ id: nanoid(), type: 'text' as PageType, title: '', textContent: '' }],
                                questions: [],
                            }
                        ],
                        badge: undefined,
                    })}>
                        <PlusCircle /> Adicionar Módulo
                    </Button>
                    <div className="flex gap-4 mt-8">
                        <Button type="submit" disabled={isSaving} name="saveAndContinue">
                            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            Salvar e Continuar Editando
                        </Button>
                        <Button type="submit" variant="secondary" disabled={isSaving} name="saveAndExit">
                            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                            Salvar e Sair
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}

function ModuleField({ moduleIndex, moduleId, removeModule, form, isEditingDisabled, isPublished, initialModuleCount }: { moduleIndex: number, moduleId: string, removeModule: (index: number) => void, form: UseFormReturn<CourseFormValues>, isEditingDisabled: boolean, isPublished: boolean, initialModuleCount: number }) {
    const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
        control: form.control, name: `modules.${moduleIndex}.lessons`,
    });
    // Derive initialLessonCount diretamente do form
    const initialLessonCount = form.getValues(`modules.${moduleIndex}.lessons`)?.length || 0;

    return (
        <AccordionItem value={`module-${moduleIndex}`} className="bg-card border rounded-lg overflow-hidden">
            <CardHeader className="p-0">
                <AccordionTrigger className="flex items-center gap-2 p-4 hover:no-underline">
                    <div className="flex-1 flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <FormField control={form.control} name={`modules.${moduleIndex}.title`} render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input {...field} placeholder={`Título do Módulo ${moduleIndex + 1}`} disabled={isEditingDisabled} className="text-lg font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-70" />
                                </FormControl>
                                <FormMessage className="ml-2" />
                            </FormItem>
                        )} />
                    </div>
                </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
                <div className="p-4 pt-0 space-y-4">
                    <h4 className="font-semibold text-muted-foreground">Aulas do Módulo</h4>
                    {lessonFields.map((lessonItem, lessonIndex) => {
                        const isExistingLesson = lessonIndex < initialLessonCount;
                        return (
                            <LessonField
                                key={lessonItem.id}
                                form={form}
                                moduleIndex={moduleIndex}
                                lessonIndex={lessonIndex}
                                removeLesson={removeLesson}
                                isEditingDisabled={isEditingDisabled || (isPublished && isExistingLesson)}
                            />
                        );
                    })}
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold text-muted-foreground">Recompensa do Módulo (Opcional)</h4>
                        <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <FormField control={form.control} name={`modules.${moduleIndex}.badge.name`} render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Input {...field} disabled={isEditingDisabled} placeholder="Nome da Medalha (Ex: Mestre da Legislação)" className="border-amber-300 focus-visible:ring-amber-500" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </div>
                <CardFooter className="bg-muted/30 p-4 flex justify-between items-center">
                    <Button type="button" variant="destructive" onClick={() => removeModule(moduleIndex)} disabled={isEditingDisabled}><Trash2 /> Remover Módulo</Button>
                    <Button type="button" variant="secondary" onClick={() => appendLesson({
                        id: nanoid(),
                        title: '',
                        summary: '',
                        type: 'text' as LessonTypeLiteral,
                        duration: 10,
                        pages: [{ id: nanoid(), type: 'text' as PageType, title: '', textContent: '' }],
                        questions: [],
                    })}><PlusCircle /> Adicionar Aula</Button>
                </CardFooter>
            </AccordionContent>
        </AccordionItem>
    );
}

function LessonField({ form, moduleIndex, lessonIndex, removeLesson, isEditingDisabled }: { form: UseFormReturn<CourseFormValues>, moduleIndex: number, lessonIndex: number, removeLesson: (index: number) => void, isEditingDisabled: boolean }) {
    // Novo: summary
    // Novo: pages (array)
    const pagesField = useFieldArray({
        control: form.control,
        name: `modules.${moduleIndex}.lessons.${lessonIndex}.pages`,
    });
    const summary = form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.summary`);
    const pages = form.watch(`modules.${moduleIndex}.lessons.${lessonIndex}.pages`) ?? [];
    const [activePage, setActivePage] = useState(0);

    return (
        <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-6">
                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título da Aula <span className="text-red-500 ml-1">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex: Introdução ao CTB" disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {/* CAMPO DE RESUMO DESTACADO */}
                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.summary`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                <span className="text-lg font-bold text-primary flex items-center gap-2">
                                    <span>Resumo / Índice de Aprendizado <span className="text-red-500 ml-1">*</span></span>
                                </span>
                            </FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Descreva o objetivo, tópicos ou índice de aprendizado desta aula..." rows={3} className="border-2 border-primary/30 bg-primary/5 focus-visible:ring-primary/50 text-base font-medium" disabled={isEditingDisabled} />
                            </FormControl>
                            <FormDescription>Este resumo será exibido para o aluno antes de iniciar a aula.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {/* Editor visual de páginas */}
                    <div>
                        <div className="flex gap-2 mb-2">
                            {pages.map((page: any, idx: number) => (
                                <button
                                    key={page.id}
                                    type="button"
                                    className={`px-3 py-1 rounded-t ${activePage === idx ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} transition-colors duration-150`}
                                    onClick={() => setActivePage(idx)}
                                >
                                    {page.title || `Página ${idx + 1}`}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="ml-2 px-2 py-1 rounded bg-green-100 text-green-800 border border-green-300 hover:bg-green-200"
                                onClick={() => pagesField.append({ id: nanoid(), type: 'text' as PageType, title: '', textContent: '' })}
                                disabled={isEditingDisabled}
                            >+ Página</button>
                        </div>
                        {pages.length > 0 && pages[activePage] && (
                            <div className="border rounded-b-lg p-4 bg-background animate-fade-in">
                                <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${activePage}.title`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título da Página <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: Introdução, Vídeo 1, Material Complementar..." disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.pages?.[activePage]?.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${activePage}.type`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Página <span className="text-red-500 ml-1">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isEditingDisabled}>
                                            <FormControl>
                                                <SelectTrigger className={form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.pages?.[activePage]?.type ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="video">Vídeo</SelectItem>
                                                <SelectItem value="text">Texto</SelectItem>
                                                <SelectItem value="file">Arquivos</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {/* Conteúdo dinâmico da página */}
                                {pages[activePage].type === 'video' && (
                                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${activePage}.videoUrl`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL do Vídeo <span className="text-red-500 ml-1">*</span></FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://www.youtube.com/watch?v=..." disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.pages?.[activePage]?.videoUrl ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                {pages[activePage].type === 'text' && (
                                    <>
                                        <div className="flex gap-2 mb-2">
                                            <MarkdownAdvancedGuideModal />
                                            <InsertImageButton onInsert={markdown => form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${activePage}.textContent`, (form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${activePage}.textContent`) || '') + '\n' + markdown)} />
                                        </div>
                                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${activePage}.textContent`} render={({ field }) => {
  // Inicializa o editor Tiptap
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: field.value || '',
    onUpdate: ({ editor }) => {
      field.onChange(editor.getHTML());
    },
    editable: !isEditingDisabled,
  });
  // Sincroniza valor externo (reset do form)
  useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(field.value || '', false);
    }
  }, [field.value]);
  return (
    <FormItem>
      <FormLabel>Conteúdo de Texto <span className="text-red-500 ml-1">*</span></FormLabel>
      <div className="border rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/50">
        <div className="relative">
          {!editor?.getText() && <span className="absolute left-4 top-3 text-muted-foreground pointer-events-none select-none">Digite o conteúdo da página...</span>}
          <EditorContent editor={editor} className="min-h-[180px] p-3 text-base font-medium prose max-w-none focus:outline-none" />
        </div>
      </div>
      {form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.pages?.[activePage]?.textContent && (
        <p className="text-red-500 text-sm mt-1">{form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.pages?.[activePage]?.textContent.message}</p>
      )}
    </FormItem>
  );
}} />
                                    </>
                                )}
                                {pages[activePage].type === 'file' && (
                                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.pages.${activePage}.files`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Arquivos <span className="text-red-500 ml-1">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="file" multiple onChange={e => {
                                                    const files = Array.from(e.target.files ?? []);
                                                    // Simulação: gerar URLs locais (substitua por upload real se necessário)
                                                    const fileObjs = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
                                                    field.onChange([...(field.value ?? []), ...fileObjs]);
                                                }} disabled={isEditingDisabled} />
                                            </FormControl>
                                            <div className="mt-2 space-y-1">
                                                {Array.isArray(field.value) && field.value.map((f: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm">
                                                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">{f.name}</a>
                                                        <button type="button" className="text-red-500 hover:underline" onClick={() => field.onChange((Array.isArray(field.value) ? field.value : []).filter((_: any, idx: number) => idx !== i))} disabled={isEditingDisabled}>Remover</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                <div className="flex justify-between mt-4">
                                    <Button type="button" variant="destructive" onClick={() => pagesField.remove(activePage)} disabled={isEditingDisabled || pages.length <= 1}>Remover Página</Button>
                                    <Button type="button" variant="secondary" onClick={() => setActivePage(Math.max(0, activePage - 1))} disabled={activePage === 0}>Anterior</Button>
                                    <Button type="button" variant="secondary" onClick={() => setActivePage(Math.min(pages.length - 1, activePage + 1))} disabled={activePage === pages.length - 1}>Próxima</Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Preview dinâmico aprimorado */}
                    <div className="mt-6">
                        <h4 className="font-semibold mb-2">Pré-visualização da Aula</h4>
                        <div className="border rounded-lg p-4 bg-background shadow-sm animate-fade-in">
                            <div className="mb-2 text-primary font-medium text-base">{summary}</div>
                            <div className="flex items-center gap-2 mb-2">
                                {pages.map((page: any, idx: number) => (
                                    <button
                                        key={page.id}
                                        type="button"
                                        className={`px-2 py-1 rounded ${activePage === idx ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} text-xs`}
                                        onClick={() => setActivePage(idx)}
                                    >
                                        {page.title || `Página ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                            {pages.length > 0 && pages[activePage] && (
                                <div>
                                    <div className="font-bold mb-1 text-lg">{pages[activePage].title}</div>
                                    {pages[activePage].type === 'video' && pages[activePage].videoUrl && (
                                        <video src={pages[activePage].videoUrl} controls className="w-full max-w-lg rounded shadow" />
                                    )}
                                    {pages[activePage].type === 'text' && pages[activePage].textContent && (
                                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: pages[activePage].textContent.replace(/\n/g, '<br/>') }} />
                                    )}
                                    {pages[activePage].type === 'file' && pages[activePage].files && (
                                        <ul className="list-disc ml-6">
                                            {pages[activePage].files.map((f: any, i: number) => (
                                                <li key={i}><a href={f.url} target="_blank" rel="noopener noreferrer" className="underline">{f.name}</a></li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(lessonIndex)} disabled={isEditingDisabled} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
        </Card>
    );
}

function MaterialField({ form, moduleIndex, lessonIndex, isEditingDisabled }: { form: UseFormReturn<CourseFormValues>, moduleIndex: number, lessonIndex: number, isEditingDisabled: boolean }) {
    const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.materials` });
    return (
        <div className="space-y-3 pt-3 border-t border-dashed">
            <Label>Material de Apoio (Opcional)</Label>
            {materialFields.map((materialItem, materialIndex) => (
                <div key={materialItem.id} className="flex items-end gap-2 p-3 rounded-md bg-background/50 border">
                    <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.materials.${materialIndex}.name`} render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">Nome do Arquivo <span className="text-red-500 ml-1">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Resumo.pdf" disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.materials?.[materialIndex]?.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.materials.${materialIndex}.url`} render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">URL <span className="text-red-500 ml-1">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://..." disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.materials?.[materialIndex]?.url ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(materialIndex)} disabled={isEditingDisabled} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendMaterial({ name: '', url: '' })} disabled={isEditingDisabled}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Material</Button>
        </div>
    );
}

function QuizBuilder({ form, moduleIndex, lessonIndex, isEditingDisabled }: { form: UseFormReturn<CourseFormValues>, moduleIndex: number, lessonIndex: number, isEditingDisabled: boolean }) {
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.questions` });
    return (
        <div className="space-y-4 pt-3 border-t border-dashed">
            <Label className="text-base font-semibold">Construtor de Prova (Quiz)</Label>
            <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.passingScore`} render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><Percent /> Nota para Aprovação <span className="text-red-500 ml-1">*</span></FormLabel>
                    <FormControl>
                        <Input type="number" {...field} placeholder="Ex: 70" disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.passingScore ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <div className="space-y-4">
                {questionFields.map((questionItem, questionIndex) => (
                    <QuestionField key={questionItem.id} {...{ form, moduleIndex, lessonIndex, questionIndex, removeQuestion, isEditingDisabled }} />
                ))}
            </div>
            {form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.root && (<p className="text-sm font-medium text-destructive">{form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.root.message}</p>)}
            <Button type="button" variant="outline" size="sm" onClick={() => appendQuestion({ question: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] })} disabled={isEditingDisabled}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Questão</Button>
        </div>
    );
}

function QuestionField({ form, moduleIndex, lessonIndex, questionIndex, removeQuestion, isEditingDisabled }: { form: UseFormReturn<CourseFormValues>, moduleIndex: number, lessonIndex: number, questionIndex: number, removeQuestion: (index: number) => void, isEditingDisabled: boolean }) {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options` });
    const optionsPath = `modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options`;

    return (
        <Card className="p-4 bg-background/60">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.question`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Questão {questionIndex + 1} <span className="text-red-500 ml-1">*</span></FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Digite o enunciado da questão aqui..." disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.[questionIndex]?.question ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormItem>
                        <FormLabel>Opções de Resposta (marque a correta)</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={(value) => {
                                    const newOptions = form.getValues(optionsPath as any).map((opt: any, idx: number) => ({ ...opt, isCorrect: idx === parseInt(value) }));
                                    form.setValue(optionsPath as any, newOptions, { shouldValidate: true });
                                }}
                                value={optionFields.findIndex(opt => opt.isCorrect).toString()}
                                disabled={isEditingDisabled}
                            >
                                <div className="space-y-3">
                                    {optionFields.map((optionItem, optionIndex) => (
                                        <div key={optionItem.id} className="flex items-center gap-2">
                                            <RadioGroupItem value={optionIndex.toString()} id={`${optionItem.id}-radio`} />
                                            <FormField control={form.control} name={`${optionsPath}.${optionIndex}.text` as any} render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input {...field} placeholder={`Opção ${optionIndex + 1}`} disabled={isEditingDisabled} className={`${form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.[questionIndex]?.options?.[optionIndex]?.text ? 'border-red-500 focus-visible:ring-red-500' : ''}`} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optionIndex)} className="text-muted-foreground hover:text-destructive h-8 w-8" disabled={optionFields.length <= 2 || isEditingDisabled}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        {form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.[questionIndex]?.options?.root && (<p className="text-sm font-medium text-destructive pt-2">{form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.[questionIndex]?.options?.root.message}</p>)}
                    </FormItem>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ text: '', isCorrect: false })} disabled={isEditingDisabled}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Opção</Button>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(questionIndex)} disabled={isEditingDisabled} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
        </Card>
    );
}
