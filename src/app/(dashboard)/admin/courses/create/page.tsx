'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, FileUp, Sparkles, FileText, Video, ClipboardCheck, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const supportingMaterialSchema = z.object({
  name: z.string().min(1, "O nome do material é obrigatório."),
  // No frontend, lidamos com o File object, mas para o schema é mais sobre a referência
  url: z.string().url("URL inválida.").optional(),
});

const lessonSchema = z.object({
  title: z.string().min(3, "O título da aula é obrigatório."),
  type: z.enum(['video', 'text', 'quiz'], { required_error: "Selecione o tipo de aula."}),
  duration: z.coerce.number().min(1, "A duração deve ser de pelo menos 1 minuto."),
  materials: z.array(supportingMaterialSchema).optional(),
});

const badgeSchema = z.object({
    name: z.string().min(3, "O nome da medalha é obrigatório."),
    // icon: z.instanceof(File).optional() // Placeholder for icon upload
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

const lessonTypeIcons = {
    video: <Video className="h-4 w-4" />,
    text: <FileText className="h-4 w-4" />,
    quiz: <ClipboardCheck className="h-4 w-4" />,
};

export default function CreateCoursePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            modules: [],
        },
    });

    const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
        control: form.control,
        name: 'modules',
    });

    const onSubmit = async (values: CourseFormValues) => {
        setIsSubmitting(true);
        console.log('Creating course with values:', values);
        // Lógica de envio para o Firebase aqui
        setTimeout(() => {
            toast({
                title: 'Curso Criado com Sucesso!',
                description: `O curso "${values.title}" foi estruturado.`,
            });
            router.push('/admin/courses');
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Construtor de Cursos</h1>
                    <p className="text-muted-foreground">Crie uma experiência de aprendizado completa e interativa.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações Gerais do Curso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título do Curso</FormLabel>
                                <FormControl><Input {...field} placeholder="Ex: Direção Defensiva Avançada" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <FormControl><Input {...field} placeholder="Ex: Segurança, Atendimento" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição Curta</FormLabel>
                                <FormControl><Textarea {...field} placeholder="Descreva o objetivo principal do curso." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
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
                
                {form.formState.errors.modules?.root && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.modules.root.message}</p>
                )}


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

function ModuleField({ moduleIndex, removeModule, form }: { moduleIndex: number, removeModule: (index: number) => void, form: any }) {
    const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
        control: form.control,
        name: `modules.${moduleIndex}.lessons`,
    });

    return (
        <AccordionItem value={`module-${moduleIndex}`} className="bg-card border rounded-lg overflow-hidden">
            <CardHeader className="p-0">
                <AccordionTrigger className="flex items-center gap-2 p-4 hover:no-underline">
                     <div className="flex-1 flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <FormField control={form.control} name={`modules.${moduleIndex}.title`} render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl><Input {...field} placeholder={`Título do Módulo ${moduleIndex + 1}`} className="text-lg font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0" /></FormControl>
                                <FormMessage className="ml-2" />
                            </FormItem>
                        )}/>
                     </div>
                </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
                <div className="p-4 pt-0 space-y-4">
                    <h4 className="font-semibold text-muted-foreground">Aulas do Módulo</h4>
                    {lessonFields.map((lessonItem, lessonIndex) => (
                        <Card key={lessonItem.id} className="p-4 bg-muted/50">
                            <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-4">
                                    <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`} render={({ field }) => (
                                        <FormItem><FormLabel>Título da Aula</FormLabel><FormControl><Input {...field} placeholder="Ex: Introdução ao CTB" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-2 gap-4">
                                         <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.type`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger>{field.value ? <div className="flex items-center gap-2">{lessonTypeIcons[field.value]} {field.value.charAt(0).toUpperCase() + field.value.slice(1)}</div> : "Selecione..."}</SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="video"><div className="flex items-center gap-2"><Video /> Vídeo</div></SelectItem>
                                                        <SelectItem value="text"><div className="flex items-center gap-2"><FileText /> Texto</div></SelectItem>
                                                        <SelectItem value="quiz"><div className="flex items-center gap-2"><ClipboardCheck /> Quiz</div></SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`modules.${moduleIndex}.lessons.${lessonIndex}.duration`} render={({ field }) => (
                                            <FormItem><FormLabel>Duração (min)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Material de Apoio (Opcional)</Label>
                                        <Button type="button" variant="outline" size="sm"><FileUp /> Anexar PDF ou Planilha</Button>
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(lessonIndex)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </Card>
                    ))}
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold text-muted-foreground">Recompensa do Módulo (Opcional)</h4>
                        <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                             <Sparkles className="h-5 w-5 text-amber-500"/>
                             <FormField control={form.control} name={`modules.${moduleIndex}.badge.name`} render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl><Input {...field} placeholder="Nome da Medalha (Ex: Mestre da Legislação)" className="border-amber-300 focus-visible:ring-amber-500"/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </div>
                </div>
                 <CardFooter className="bg-muted/30 p-4 flex justify-between items-center">
                    <Button type="button" variant="destructive" onClick={() => removeModule(moduleIndex)}>
                        <Trash2 /> Remover Módulo
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => appendLesson({ title: '', type: 'video', duration: 10 })}>
                        <PlusCircle /> Adicionar Aula
                    </Button>
                </CardFooter>
            </CardContent>
        </AccordionItem>
    );
}