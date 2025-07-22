'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

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

export default function EditCoursePage({ params }: { params: { id: string }}) {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isPublished, setIsPublished] = useState(false);
    const [initialModuleCount, setInitialModuleCount] = useState(0);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: { 
            title: '', 
            description: '', 
            category: '', 
            modules: [],
            difficulty: 'Iniciante',
            investmentCost: 0,
            priceInCredits: 0,
            authorInfo: '',
            legalNotice: '',
        },
    });

    useEffect(() => {
        if (params.id) {
            getCourseById(params.id).then(data => {
                if (data) {
                    form.reset({
                        ...data,
                        modules: data.modules.map(m => ({
                            ...m,
                            badge: m.badge ? { name: m.badge?.name || '' } : undefined
                        })),
                    });
                    setIsPublished(data.status === 'Published');
                    setInitialModuleCount(data.modules?.length || 0);
                }
                setIsLoadingData(false);
            });
        }
    }, [params.id, form]);

    // Auto-save: salvar no localStorage
    useEffect(() => {
        const saved = localStorage.getItem('courseEditDraft-' + params.id);
        if (saved) {
            form.reset(JSON.parse(saved));
        }
    }, [params.id]);
    useEffect(() => {
        const subscription = form.watch((value) => {
            localStorage.setItem('courseEditDraft-' + params.id, JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [form, params.id]);

    const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
        control: form.control, name: 'modules',
    });

    const onSubmit = async (values: CourseFormValues) => {
        setIsSubmitting(true);
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const valuesWithIds = {
                ...values,
                modules: values.modules.map(module => ({
                    ...module,
                    id: module.id || nanoid(),
                    lessons: module.lessons.map(lesson => ({
                        ...lesson,
                        id: lesson.id || nanoid(),
                        questions: lesson.questions?.map(q => ({
                            ...q,
                            id: q.id || nanoid(),
                            options: q.options.map(o => ({ ...o, id: o.id || nanoid() }))
                        }))
                    }))
                }))
            };
            
            const result = await updateCourse(params.id, valuesWithIds, user.uid);

            if (result.success) {
                toast({ title: 'Curso Atualizado com Sucesso!', description: `O curso "${values.title}" foi salvo.` });
                router.push('/admin/courses');
            } else { throw new Error(result.error); }

        } catch (error) {
            console.error("Error updating course: ", error);
            toast({ variant: 'destructive', title: 'Erro ao Atualizar Curso', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoadingData) { return <LoadingScreen />; }

    // Pré-visualização do curso
    const [showPreview, setShowPreview] = useState(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <Progress value={100} className="mb-4" />
                <div className="flex justify-between items-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Curso</h1>
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
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Curso</h1>
                    <p className="text-muted-foreground">Ajuste os detalhes e o conteúdo do curso.</p>
                </div>

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

                <Card>
                    <CardHeader><CardTitle>Informações Gerais do Curso</CardTitle></CardHeader>
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
)}/>
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título do Curso</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Direção Defensiva Avançada" disabled={isPublished} />
                                </FormControl>
                                <FormDescription>
                                    Um título conciso e atraente para o curso.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Segurança, Atendimento" disabled={isPublished} />
                                </FormControl>
                                <FormDescription>
                                    Defina a categoria principal do curso para organização.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição Curta</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Descreva o objetivo principal do curso." disabled={isPublished} />
                                </FormControl>
                                <FormDescription>
                                    Forneça uma breve descrição do que o curso oferece.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações Financeiras, Legais e de Nível</CardTitle>
                        <CardDescription>Gerencie custos, direitos autorais e a dificuldade do curso.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField control={form.control} name="difficulty" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><Trophy /> Nível de Dificuldade</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o nível..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Iniciante"><div className="flex items-center gap-2"><BarChart/> Iniciante</div></SelectItem>
                                        <SelectItem value="Intermediário"><div className="flex items-center gap-2"><BrainCircuit/> Intermediário</div></SelectItem>
                                        <SelectItem value="Avançado"><div className="flex items-center gap-2"><Trophy/> Avançado</div></SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Defina o nível de dificuldade para ajudar os alunos a escolherem o curso certo.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                         )}/>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                            <FormField control={form.control} name="investmentCost" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><DollarSign /> Custo de Investimento (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder="Ex: 500.00" />
                                    </FormControl>
                                    <FormDescription>
                                        Valor gasto na produção ou compra deste curso.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="priceInCredits" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2"><CreditCard /> Preço em Créditos</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder="Ex: 10" />
                                    </FormControl>
                                    <FormDescription>
                                        Custo para o usuário comprar o curso. Deixe 0 para gratuito.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <div className="border-t pt-6 space-y-6">
                          <FormField control={form.control} name="authorInfo" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="flex items-center gap-2"><Copyright /> Informações de Direitos Autorais</FormLabel>
                                  <FormControl>
                                      <Input {...field} placeholder="Ex: © 2024 Nome do Produtor Terceirizado" />
                                  </FormControl>
                                  <FormDescription>
                                      Caso o conteúdo seja de terceiros, informe aqui.
                                  </FormDescription>
                                  <FormMessage />
                              </FormItem>
                          )}/>
                          <FormField control={form.control} name="legalNotice" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="flex items-center gap-2"><Gavel /> Aviso Legal sobre Reprodução</FormLabel>
                                  <FormControl>
                                      <Textarea {...field} placeholder="Ex: A reprodução deste conteúdo é proibida..." rows={3} />
                                  </FormControl>
                                  <FormDescription>
                                      Este aviso será exibido aos alunos ao acessarem as aulas.
                                  </FormDescription>
                                  <FormMessage />
                              </FormItem>
                          )}/>
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
                        return (<ModuleField key={moduleItem.id} moduleIndex={moduleIndex} removeModule={removeModule} form={form} isEditingDisabled={isEditingDisabled} isPublished={isPublished} />);
                    })}
                </Accordion>
                
                {form.formState.errors.modules?.root && (<p className="text-sm font-medium text-destructive">{form.formState.errors.modules.root.message}</p>)}

                <div className="flex justify-between items-center mt-4">
                    <Button type="button" variant="outline" onClick={() => appendModule({ title: '', lessons: [{ title: '', type: 'video', duration: 10, content: '' }] })}>
                        <PlusCircle /> Adicionar Módulo
                    </Button>
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function ModuleField({ moduleIndex, removeModule, form, isEditingDisabled, isPublished }: { moduleIndex: number, removeModule: (index: number) => void, form: UseFormReturn<CourseFormValues>, isEditingDisabled: boolean, isPublished: boolean }) {
    const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
        control: form.control, name: `modules.${moduleIndex}.lessons`,
    });
    
    // Store initial lesson count to differentiate existing from new lessons
    const [initialLessonCount] = useState(form.getValues(`modules.${moduleIndex}.lessons`)?.length || 0);

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
                        )}/>
                     </div>
                </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
                <div className="p-4 pt-0 space-y-4">
                    <h4 className="font-semibold text-muted-foreground">Aulas do Módulo</h4>
                    {lessonFields.map((lessonItem, lessonIndex) => {
                        const isExistingLesson = lessonIndex < initialLessonCount;
                        return (<LessonField key={lessonItem.id} form={form} moduleIndex={moduleIndex} lessonIndex={lessonIndex} removeLesson={removeLesson} isEditingDisabled={isEditingDisabled || (isPublished && isExistingLesson)} />);
                    })}
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold text-muted-foreground">Recompensa do Módulo (Opcional)</h4>
                        <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                             <Sparkles className="h-5 w-5 text-amber-500"/>
                             <FormField control={form.control} name={`modules.${moduleIndex}.badge.name`} render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Input {...field} disabled={isEditingDisabled} placeholder="Nome da Medalha (Ex: Mestre da Legislação)" className="border-amber-300 focus-visible:ring-amber-500"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </div>
                </div>
                 <CardFooter className="bg-muted/30 p-4 flex justify-between items-center">
                    <Button type="button" variant="destructive" onClick={() => removeModule(moduleIndex)} disabled={isEditingDisabled}><Trash2 /> Remover Módulo</Button>
                    <Button type="button" variant="secondary" onClick={() => appendLesson({ title: '', type: 'video', duration: 10, content: '', materials: [] })}><PlusCircle /> Adicionar Aula</Button>
                </CardFooter>
            </AccordionContent>
        </AccordionItem>
    );
}

function LessonField({ form, moduleIndex, lessonIndex, removeLesson, isEditingDisabled }: { form: UseFormReturn<CourseFormValues>, moduleIndex: number, lessonIndex: number, removeLesson: (index: number) => void, isEditingDisabled: boolean }) {
    const lessonType = useWatch({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.type` });
    const watchedContent = useWatch({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.content` });

    return (
        <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título da Aula</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex: Introdução ao CTB" disabled={isEditingDisabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.type`} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditingDisabled}>
                                    <FormControl>
                                        <SelectTrigger>{field.value ? <div className="flex items-center gap-2">{lessonTypeIcons[field.value]} {field.value.charAt(0).toUpperCase() + field.value.slice(1)}</div> : "Selecione..."}</SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="video"><div className="flex items-center gap-2"><Video /> Vídeo</div></SelectItem>
                                        <SelectItem value="text"><div className="flex items-center gap-2"><FileText /> Texto</div></SelectItem>
                                        <SelectItem value="audio"><div className="flex items-center gap-2"><Mic /> Áudio</div></SelectItem>
                                        <SelectItem value="quiz"><div className="flex items-center gap-2"><ClipboardCheck /> Prova (Quiz)</div></SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.duration`} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duração (min)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} disabled={isEditingDisabled} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                     {lessonType === 'video' && (<FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.content`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL do Vídeo (YouTube/Vimeo)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="https://www.youtube.com/watch?v=..." disabled={isEditingDisabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>)}
                    {lessonType === 'audio' && (<FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.audioFile`} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Arquivo de Áudio</FormLabel>
                            <FormControl>
                                <Input type="file" accept="audio/*" onChange={(e) => field.onChange(e.target.files?.[0])} disabled={isEditingDisabled} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                            </FormControl>
                            <FormDescription>
                                Se já houver um áudio salvo, o envio de um novo irá substituí-lo.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}/>)}
                    {lessonType === 'text' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.contentBlocks`} render={({ field }) => (
      <FormItem className="md:col-span-1">
        <FormLabel>Conteúdo da Aula (Blocos)</FormLabel>
        <Controller
          control={form.control}
          name={`modules.${moduleIndex}.lessons.${lessonIndex}.contentBlocks`}
          render={({ field }) => (
            <ContentBlocksEditor value={(field.value as import('@/lib/types').ContentBlock[]) ?? []} onChange={field.onChange} />
          )}
        />
        <FormMessage />
      </FormItem>
    )}/>
    <div className="md:col-span-1 space-y-2">
      <FormLabel>Preview</FormLabel>
      <div className="prose dark:prose-invert max-w-none rounded-md border bg-background p-4 min-h-[256px] overflow-x-auto">
        {((form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.contentBlocks`) as import('@/lib/types').ContentBlock[]) ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">A pré-visualização aparecerá aqui.</p>
        ) : (
          (form.getValues(`modules.${moduleIndex}.lessons.${lessonIndex}.contentBlocks`) as import('@/lib/types').ContentBlock[]).map((block, idx) => {
            if (block.type === 'heading') {
              const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
              return <Tag key={idx} className="mt-4 mb-2">{block.text}</Tag>;
            }
            if (block.type === 'paragraph') {
              return <ReactMarkdown key={idx} remarkPlugins={[remarkGfm]}>{block.text || ''}</ReactMarkdown>;
            }
            if (block.type === 'list') {
              if (block.style === 'numbered') {
                return <ol key={idx} className="list-decimal ml-6">{(block.items || []).map((item, i) => <li key={i}>{item}</li>)}</ol>;
              }
              return <ul key={idx} className="list-disc ml-6">{(block.items || []).map((item, i) => <li key={i}>{item}</li>)}</ul>;
            }
            if (block.type === 'image') {
              return <div key={idx} className="my-4"><img src={block.url} alt={block.alt || ''} className="max-w-full rounded shadow" /><div className="text-xs text-center text-muted-foreground">{block.alt}</div></div>;
            }
            return null;
          })
        )}
      </div>
    </div>
  </div>
)}
                    {lessonType === 'quiz' ? (<QuizBuilder form={form} moduleIndex={moduleIndex} lessonIndex={lessonIndex} isEditingDisabled={isEditingDisabled} />) : (<MaterialField form={form} moduleIndex={moduleIndex} lessonIndex={lessonIndex} isEditingDisabled={isEditingDisabled} />)}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(lessonIndex)} disabled={isEditingDisabled} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
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
                                <FormLabel className="text-xs">Nome do Arquivo</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Resumo.pdf" disabled={isEditingDisabled} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.materials.${materialIndex}.url`} render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs">URL</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://..." disabled={isEditingDisabled} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(materialIndex)} disabled={isEditingDisabled} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9"><Trash2 className="h-4 w-4"/></Button>
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
                    <FormLabel className="flex items-center gap-2"><Percent/> Nota para Aprovação (%)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} placeholder="Ex: 70" disabled={isEditingDisabled} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
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
                            <FormLabel>Questão {questionIndex + 1}</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Digite o enunciado da questão aqui..." disabled={isEditingDisabled} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
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
                                                    <Input {...field} placeholder={`Opção ${optionIndex + 1}`} disabled={isEditingDisabled} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optionIndex)} className="text-muted-foreground hover:text-destructive h-8 w-8" disabled={optionFields.length <= 2 || isEditingDisabled}><Trash2 className="h-4 w-4"/></Button>
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
                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(questionIndex)} disabled={isEditingDisabled} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
            </div>
        </Card>
    );
}
