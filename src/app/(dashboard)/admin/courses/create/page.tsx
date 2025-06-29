
'use client';

import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firestore/lite';
import { nanoid } from 'nanoid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Sparkles, FileText, Video, ClipboardCheck, GripVertical, Paperclip, HelpCircle, Check, Percent } from 'lucide-react';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Schemas
const supportingMaterialSchema = z.object({
  name: z.string().min(1, "O nome do material é obrigatório."),
  url: z.string().url("URL inválida."),
});

const quizOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "O texto da opção é obrigatório."),
  isCorrect: z.boolean().default(false),
});

const quizQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, "A pergunta é obrigatória."),
  options: z.array(quizOptionSchema).min(2, "A questão deve ter pelo menos 2 opções."),
}).refine(data => data.options.filter(opt => opt.isCorrect).length === 1, {
  message: "Exatamente uma opção deve ser marcada como correta.",
  path: ['options'],
});

const lessonSchema = z.object({
  title: z.string().min(3, "O título da aula é obrigatório."),
  type: z.enum(['video', 'text', 'quiz'], { required_error: "Selecione o tipo de aula."}),
  duration: z.coerce.number().min(1, "A duração deve ser de pelo menos 1 minuto."),
  materials: z.array(supportingMaterialSchema).optional(),
  questions: z.array(quizQuestionSchema).optional(),
  passingScore: z.coerce.number().min(0).max(100).optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'quiz') {
        if (!data.questions || data.questions.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Um quiz precisa de pelo menos uma questão.", path: ['questions'] });
        }
        if (data.passingScore === undefined || data.passingScore === null) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A nota para aprovação é obrigatória.", path: ['passingScore'] });
        }
    }
});

const badgeSchema = z.object({
    name: z.string().min(3, "O nome da medalha é obrigatório.").optional().or(z.literal('')),
});

const moduleSchema = z.object({
  title: z.string().min(3, "O título do módulo é obrigatório."),
  lessons: z.array(lessonSchema).min(1, "Cada módulo precisa de ao menos uma aula."),
  badge: badgeSchema.optional(),
});

const courseFormSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.' }),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  category: z.string().min(3, { message: 'A categoria é obrigatória.' }),
  modules: z.array(moduleSchema).min(1, "O curso deve ter pelo menos um módulo."),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

// Icons
const lessonTypeIcons = {
    video: <Video className="h-4 w-4" />,
    text: <FileText className="h-4 w-4" />,
    quiz: <ClipboardCheck className="h-4 w-4" />,
};

// Main Component
export default function CreateCoursePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: {
            title: '', description: '', category: '', modules: [],
        },
    });

    const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
        control: form.control, name: 'modules',
    });

    const onSubmit = async (values: CourseFormValues) => {
        setIsSubmitting(true);
        try {
            const courseId = nanoid();
            let totalLessons = 0;
            let totalDuration = 0;

            const modulesWithIds = values.modules.map(module => {
                const lessonsWithIds = module.lessons.map(lesson => {
                    totalLessons++;
                    totalDuration += lesson.duration;

                    const questionsWithIds = lesson.questions?.map(q => ({
                        ...q,
                        id: nanoid(),
                        options: q.options.map(o => ({ ...o, id: nanoid() }))
                    }));
                    
                    return { ...lesson, id: nanoid(), questions: questionsWithIds };
                });
                
                const badgeData = (module.badge?.name && module.badge.name.trim() !== '') 
                    ? { name: module.badge.name.trim(), iconUrl: '' } 
                    : null;

                return { ...module, id: nanoid(), lessons: lessonsWithIds, badge: badgeData };
            });
            
            const courseData = {
                id: courseId, title: values.title, description: values.description, category: values.category,
                modules: modulesWithIds, totalLessons, totalDuration, createdAt: serverTimestamp(), status: 'Draft'
            };
            
            await setDoc(doc(db, 'courses', courseId), courseData);

            toast({ title: 'Curso Criado com Sucesso!', description: `O curso "${values.title}" foi salvo como rascunho.` });
            router.push('/admin/courses');

        } catch (error) {
            console.error("Error creating course: ", error);
            toast({ variant: 'destructive', title: 'Erro ao Criar Curso', description: 'Não foi possível salvar o curso. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Construtor de Cursos</h1>
                    <p className="text-muted-foreground">Crie uma experiência de aprendizado completa e interativa.</p>
                </div>

                <Card>
                    <CardHeader><CardTitle>Informações Gerais do Curso</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título do Curso</FormLabel><FormControl><Input {...field} placeholder="Ex: Direção Defensiva Avançada" /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} placeholder="Ex: Segurança, Atendimento" /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição Curta</FormLabel><FormControl><Textarea {...field} placeholder="Descreva o objetivo principal do curso." /></FormControl><FormMessage /></FormItem>)}/>
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-2xl font-bold font-headline">Estrutura do Curso</h2>
                    <p className="text-muted-foreground">Adicione módulos e aulas para montar o conteúdo.</p>
                </div>
                
                <Accordion type="multiple" className="w-full space-y-4">
                    {moduleFields.map((moduleItem, moduleIndex) => (
                        <ModuleField key={moduleItem.id} moduleIndex={moduleIndex} removeModule={removeModule} form={form} />
                    ))}
                </Accordion>
                
                {form.formState.errors.modules?.root && (<p className="text-sm font-medium text-destructive">{form.formState.errors.modules.root.message}</p>)}

                <div className="flex justify-between items-center mt-4">
                    <Button type="button" variant="outline" onClick={() => appendModule({ title: '', lessons: [{ title: '', type: 'video', duration: 10 }] })}>
                        <PlusCircle /> Adicionar Módulo
                    </Button>
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Curso Completo
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// Module Component
function ModuleField({ moduleIndex, removeModule, form }: { moduleIndex: number, removeModule: (index: number) => void, form: any }) {
    const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
        control: form.control, name: `modules.${moduleIndex}.lessons`,
    });

    return (
        <AccordionItem value={`module-${moduleIndex}`} className="bg-card border rounded-lg overflow-hidden">
            <CardHeader className="p-0">
                <AccordionTrigger className="flex items-center gap-2 p-4 hover:no-underline">
                     <div className="flex-1 flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <FormField control={form.control} name={`modules.${moduleIndex}.title`} render={({ field }) => (<FormItem className="w-full"><FormControl><Input {...field} placeholder={`Título do Módulo ${moduleIndex + 1}`} className="text-lg font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0" /></FormControl><FormMessage className="ml-2" /></FormItem>)}/>
                     </div>
                </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
                <div className="p-4 pt-0 space-y-4">
                    <h4 className="font-semibold text-muted-foreground">Aulas do Módulo</h4>
                    {lessonFields.map((lessonItem, lessonIndex) => (
                       <LessonField key={lessonItem.id} form={form} moduleIndex={moduleIndex} lessonIndex={lessonIndex} removeLesson={removeLesson} />
                    ))}
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold text-muted-foreground">Recompensa do Módulo (Opcional)</h4>
                        <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                             <Sparkles className="h-5 w-5 text-amber-500"/>
                             <FormField control={form.control} name={`modules.${moduleIndex}.badge.name`} render={({ field }) => (<FormItem className="w-full"><FormControl><Input {...field} placeholder="Nome da Medalha (Ex: Mestre da Legislação)" className="border-amber-300 focus-visible:ring-amber-500"/></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                    </div>
                </div>
                 <CardFooter className="bg-muted/30 p-4 flex justify-between items-center">
                    <Button type="button" variant="destructive" onClick={() => removeModule(moduleIndex)}><Trash2 /> Remover Módulo</Button>
                    <Button type="button" variant="secondary" onClick={() => appendLesson({ title: '', type: 'video', duration: 10, materials: [] })}><PlusCircle /> Adicionar Aula</Button>
                </CardFooter>
            </AccordionContent>
        </AccordionItem>
    );
}

// Lesson Component
function LessonField({ form, moduleIndex, lessonIndex, removeLesson }: { form: any, moduleIndex: number, lessonIndex: number, removeLesson: (index: number) => void }) {
    const lessonType = useWatch({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.type` });

    return (
        <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`} render={({ field }) => (<FormItem><FormLabel>Título da Aula</FormLabel><FormControl><Input {...field} placeholder="Ex: Introdução ao CTB" /></FormControl><FormMessage /></FormItem>)}/>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.type`} render={({ field }) => (<FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger>{field.value ? <div className="flex items-center gap-2">{lessonTypeIcons[field.value]} {field.value.charAt(0).toUpperCase() + field.value.slice(1)}</div> : "Selecione..."}</SelectTrigger></FormControl><SelectContent><SelectItem value="video"><div className="flex items-center gap-2"><Video /> Vídeo</div></SelectItem><SelectItem value="text"><div className="flex items-center gap-2"><FileText /> Texto</div></SelectItem><SelectItem value="quiz"><div className="flex items-center gap-2"><ClipboardCheck /> Prova (Quiz)</div></SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.duration`} render={({ field }) => (<FormItem><FormLabel>Duração (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>

                    {lessonType === 'quiz' ? (
                        <QuizBuilder form={form} moduleIndex={moduleIndex} lessonIndex={lessonIndex} />
                    ) : (
                        <MaterialField form={form} moduleIndex={moduleIndex} lessonIndex={lessonIndex} />
                    )}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(lessonIndex)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
            </div>
        </Card>
    );
}

// Material Component
function MaterialField({ form, moduleIndex, lessonIndex }: { form: any, moduleIndex: number, lessonIndex: number }) {
    const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.materials` });
    return (
        <div className="space-y-3 pt-3 border-t border-dashed">
            <Label>Material de Apoio (Opcional)</Label>
            {materialFields.map((materialItem, materialIndex) => (
                <div key={materialItem.id} className="flex items-end gap-2 p-3 rounded-md bg-background/50 border">
                    <Paperclip className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.materials.${materialIndex}.name`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Nome do Arquivo</FormLabel><FormControl><Input {...field} placeholder="Ex: Resumo.pdf" /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.materials.${materialIndex}.url`} render={({ field }) => (<FormItem><FormLabel className="text-xs">URL</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(materialIndex)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9"><Trash2 className="h-4 w-4"/></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendMaterial({ name: '', url: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Material</Button>
        </div>
    );
}

// Quiz Components
function QuizBuilder({ form, moduleIndex, lessonIndex }: { form: any, moduleIndex: number, lessonIndex: number }) {
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.questions` });
    return (
        <div className="space-y-4 pt-3 border-t border-dashed">
            <Label className="text-base font-semibold">Construtor de Prova (Quiz)</Label>
            <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.passingScore`} render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Percent/> Nota para Aprovação (%)</FormLabel><FormControl><Input type="number" {...field} placeholder="Ex: 70" /></FormControl><FormMessage /></FormItem>)}/>
            
            <div className="space-y-4">
                {questionFields.map((questionItem, questionIndex) => (
                    <QuestionField key={questionItem.id} {...{ form, moduleIndex, lessonIndex, questionIndex, removeQuestion }} />
                ))}
            </div>
            {form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.root && (<p className="text-sm font-medium text-destructive">{form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.root.message}</p>)}

            <Button type="button" variant="outline" size="sm" onClick={() => appendQuestion({ question: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] })}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Questão</Button>
        </div>
    );
}

function QuestionField({ form, moduleIndex, lessonIndex, questionIndex, removeQuestion }: { form: any, moduleIndex: number, lessonIndex: number, questionIndex: number, removeQuestion: (index: number) => void }) {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control: form.control, name: `modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options` });
    const optionsPath = `modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.options`;

    return (
        <Card className="p-4 bg-background/60">
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.questions.${questionIndex}.question`} render={({ field }) => (<FormItem><FormLabel>Questão {questionIndex + 1}</FormLabel><FormControl><Textarea {...field} placeholder="Digite o enunciado da questão aqui..." /></FormControl><FormMessage /></FormItem>)}/>
                    
                    <FormItem>
                        <FormLabel>Opções de Resposta (marque a correta)</FormLabel>
                        <FormControl>
                            <RadioGroup 
                                onValueChange={(value) => {
                                    const newOptions = form.getValues(optionsPath).map((opt: any, idx: number) => ({ ...opt, isCorrect: idx === parseInt(value) }));
                                    form.setValue(optionsPath, newOptions, { shouldValidate: true });
                                }}
                                value={optionFields.findIndex(opt => opt.isCorrect).toString()}
                            >
                                <div className="space-y-3">
                                {optionFields.map((optionItem, optionIndex) => (
                                    <div key={optionItem.id} className="flex items-center gap-2">
                                        <RadioGroupItem value={optionIndex.toString()} id={`${optionItem.id}-radio`} />
                                        <FormField control={form.control} name={`${optionsPath}.${optionIndex}.text`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} placeholder={`Opção ${optionIndex + 1}`} /></FormControl><FormMessage /></FormItem>)}/>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optionIndex)} className="text-muted-foreground hover:text-destructive h-8 w-8" disabled={optionFields.length <= 2}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                                </div>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                         {form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.[questionIndex]?.options?.root && (<p className="text-sm font-medium text-destructive pt-2">{form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.questions?.[questionIndex]?.options?.root.message}</p>)}
                    </FormItem>

                    <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ text: '', isCorrect: false })}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Opção</Button>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(questionIndex)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
            </div>
        </Card>
    );
}
