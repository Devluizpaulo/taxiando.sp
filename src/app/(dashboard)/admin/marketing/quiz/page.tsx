
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from 'nanoid';
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  setActiveQuiz,
  getAllQuizzes,
} from '@/app/actions/quiz-actions';
import { type QuizFormValues, quizFormSchema } from '@/lib/quiz-schemas';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz-flow';

import { type QuizData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Sparkles, Wand2, Star, Edit, Power, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LoadingScreen } from '@/components/loading-screen';


function QuizForm({ quiz, onFinished }: { quiz?: QuizData | null, onFinished: () => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState('');

    const form = useForm<QuizFormValues>({
        resolver: zodResolver(quizFormSchema),
        defaultValues: quiz ? {
            title: quiz.title,
            questions: quiz.questions.map(q => ({
                ...q,
                options: q.options.map(o => ({ id: o.id || nanoid(), text: o.text }))
            }))
        } : {
            title: '',
            questions: [],
        },
    });

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: form.control,
        name: 'questions',
    });

    const handleAiGenerate = async () => {
        if (aiTopic.trim().length < 5) {
            toast({ variant: 'destructive', title: 'Tópico muito curto', description: 'Descreva melhor o assunto do quiz.' });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateQuiz({ topic: aiTopic });
            form.setValue('title', result.title);
            
            // Transform AI output to match form structure
            const newQuestions = result.questions.map(q => {
                const options = q.options.map(o => ({ id: nanoid(), text: o.text }));
                const correctOptionIndex = q.options.findIndex(o => o.isCorrect);
                const correctOptionId = options[correctOptionIndex]?.id || options[0].id;
                
                return {
                    id: nanoid(),
                    question: q.question,
                    options: options,
                    correctOptionId: correctOptionId,
                }
            });
            form.setValue('questions', newQuestions);
            toast({ title: 'Quiz Gerado!', description: 'O quiz foi preenchido com a sugestão da IA.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro da IA', description: 'Não foi possível gerar o quiz.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const onSubmit = async (values: QuizFormValues) => {
        setIsSubmitting(true);
        try {
            const result = quiz
                ? await updateQuiz(quiz.id, values)
                : await createQuiz(values);

            if (result.success) {
                toast({ title: quiz ? 'Quiz Atualizado!' : 'Quiz Criado!', description: 'Seu quiz foi salvo com sucesso.' });
                onFinished();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Assistente de IA</CardTitle>
                        <CardDescription>Sem ideias? Descreva um tópico e deixe a IA criar um quiz completo para você.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="ai-topic">Tópico do Quiz</Label>
                            <Input id="ai-topic" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="Ex: novas regras de trânsito em SP" />
                        </div>
                        <Button type="button" onClick={handleAiGenerate} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 />} Gerar
                        </Button>
                    </CardContent>
                </Card>

                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Título do Quiz</FormLabel><FormControl><Input {...field} placeholder="Quiz: Direção Defensiva" /></FormControl><FormMessage /></FormItem>
                )}/>

                <div className="space-y-4">
                    <Label>Questões</Label>
                    {questionFields.map((question, qIndex) => (
                        <QuestionField key={question.id} form={form} qIndex={qIndex} removeQuestion={removeQuestion} />
                    ))}
                    {form.formState.errors.questions?.root && (<p className="text-sm font-medium text-destructive">{form.formState.errors.questions.root.message}</p>)}
                </div>

                <div className="flex justify-between">
                     <Button type="button" variant="outline" onClick={() => appendQuestion({ id: nanoid(), question: '', options: [{id: nanoid(), text: ''}, {id: nanoid(), text: ''}], correctOptionId: '' })}>
                        <PlusCircle /> Adicionar Questão
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isGenerating}>
                        {(isSubmitting || isGenerating) && <Loader2 className="mr-2 animate-spin"/>} Salvar Quiz
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function QuestionField({ form, qIndex, removeQuestion }: { form: any, qIndex: number, removeQuestion: (index: number) => void }) {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control: form.control,
        name: `questions.${qIndex}.options`,
    });

    const optionsPath = `questions.${qIndex}.options`;
    const options = useWatch({ control: form.control, name: optionsPath });

    return (
        <Card className="p-4 bg-muted/50 relative">
            <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)} className="absolute top-2 right-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
            
            <FormField control={form.control} name={`questions.${qIndex}.question`} render={({ field }) => (
                <FormItem><FormLabel>Questão {qIndex + 1}</FormLabel><FormControl><Textarea {...field} placeholder="Digite o enunciado da questão..." /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="mt-4 space-y-2">
                <Label>Opções de Resposta (marque a correta)</Label>
                <FormField
                    control={form.control}
                    name={`questions.${qIndex}.correctOptionId`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                                    {optionFields.map((option, oIndex) => (
                                        <div key={option.id} className="flex items-center gap-2">
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <div className="flex-1">
                                                 <FormField control={form.control} name={`${optionsPath}.${oIndex}.text`} render={({ field }) => (
                                                    <FormItem><FormControl><Input {...field} placeholder={`Opção ${oIndex + 1}`} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(oIndex)} disabled={optionFields.length <= 2} className="h-8 w-8 text-muted-foreground"><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendOption({ id: nanoid(), text: '' })}>
                <PlusCircle /> Adicionar Opção
            </Button>
        </Card>
    );
}

export default function QuizAdminPage() {
    const [quizzes, setQuizzes] = useState<QuizData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);
    const [quizToDelete, setQuizToDelete] = useState<QuizData | null>(null);
    const { toast } = useToast();

    const fetchQuizzes = async () => {
        setLoading(true);
        const data = await getAllQuizzes();
        setQuizzes(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleFormFinished = () => {
        setIsFormOpen(false);
        setSelectedQuiz(null);
        fetchQuizzes();
    };
    
    const handleSetQuizActive = async (quizId: string) => {
        const result = await setActiveQuiz(quizId);
        if (result.success) {
            toast({ title: 'Quiz Ativado!', description: 'Este quiz agora será exibido na página inicial.' });
            fetchQuizzes();
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
    };
    
    const handleDeleteQuiz = async () => {
        if (!quizToDelete) return;
        const result = await deleteQuiz(quizToDelete.id);
         if (result.success) {
            toast({ title: 'Quiz Removido!', description: `O quiz "${quizToDelete.title}" foi removido.` });
            fetchQuizzes();
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
        setQuizToDelete(null);
    };

    if (loading) {
        return <LoadingScreen />;
    }
    
    const activeQuiz = quizzes.find(q => q.status === 'Active');

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Quizzes</h1>
                <p className="text-muted-foreground">Crie e gerencie quizzes interativos para a página inicial.</p>
            </div>
            
            {activeQuiz && (
                <Card className="border-primary bg-primary/5">
                    <CardHeader className="flex-row items-center gap-4">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-primary">Quiz Ativo na Página Inicial</CardTitle>
                            <CardDescription className="text-primary/80">Este é o quiz que os visitantes estão vendo agora: <span className="font-semibold text-primary">{activeQuiz.title}</span>.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}

            <Dialog open={isFormOpen} onOpenChange={(open) => {
                if (!open) { setSelectedQuiz(null); }
                setIsFormOpen(open);
            }}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Todos os Quizzes</CardTitle>
                            <CardDescription>Crie novos quizzes ou edite os existentes.</CardDescription>
                        </div>
                         <DialogTrigger asChild>
                            <Button><PlusCircle/> Criar Novo Quiz</Button>
                        </DialogTrigger>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {quizzes.map(quiz => (
                                <li key={quiz.id} className="flex items-center justify-between rounded-md border p-4">
                                    <div>
                                        <p className="font-semibold">{quiz.title}</p>
                                        <p className="text-sm text-muted-foreground">{quiz.questions.length} questões</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {quiz.status !== 'Active' && (
                                             <Button variant="outline" size="sm" onClick={() => handleSetQuizActive(quiz.id)}><Power className="mr-2"/> Ativar</Button>
                                        )}
                                         <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedQuiz(quiz)}><Edit className="mr-2"/> Editar</Button>
                                        </DialogTrigger>
                                        <Button variant="destructive" size="sm" onClick={() => setQuizToDelete(quiz)}><Trash2 className="mr-2"/> Remover</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         {quizzes.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum quiz criado ainda.</p>}
                    </CardContent>
                </Card>
                 <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{selectedQuiz ? 'Editar Quiz' : 'Criar Novo Quiz'}</DialogTitle>
                        <DialogDescription>{selectedQuiz ? 'Ajuste as questões e o título do seu quiz.' : 'Use o assistente de IA ou crie seu quiz manualmente.'}</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-4">
                        <QuizForm quiz={selectedQuiz} onFinished={handleFormFinished} />
                    </div>
                </DialogContent>
            </Dialog>
            
             <AlertDialog open={!!quizToDelete} onOpenChange={(open) => !open && setQuizToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação removerá o quiz "{quizToDelete?.title}" permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteQuiz}>Sim, remover quiz</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
