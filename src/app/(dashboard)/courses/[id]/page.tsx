

'use client'

import { useEffect, useState, useMemo } from 'react';
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/hooks/use-auth';
import { getCourseAccessData, purchaseCourse } from '@/app/actions/course-actions';
import { trackContentView } from '@/app/actions/analytics-actions';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, CheckCircle2, Circle, Clock, PlayCircle, FileText, Award, Paperclip, Loader2, Lock, ClipboardCheck, AlertTriangle, RefreshCw, XCircle, Mic, Copyright, Gavel, ShoppingCart, Trophy, Move3D } from "lucide-react";

import { cn } from "@/lib/utils";
import { type Course, type Lesson } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LoadingScreen } from '@/components/loading-screen';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { markLessonAsComplete } from '@/app/actions/course-actions';
import { use } from 'react';


const getLessonIcon = (type: Lesson['type']) => {
    switch(type) {
        case 'single': return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'multi_page': return <Move3D className="h-5 w-5 text-muted-foreground" />;
        default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
}

const getYoutubeEmbedUrl = (url: string): string | null => {
    let videoId;
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url; // fallback to original URL
}


export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    const fetchCourseData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const result = await getCourseAccessData(id, user.uid);
            if (result.success && result.course) {
                setCourse(result.course);
                setCompletedLessons(result.completedLessons || []);
                setHasAccess(result.hasAccess || false);
                
                // Track content view
                trackContentView('course', result.course.id, result.course.title);
            } else {
                 toast({ variant: "destructive", title: "Erro", description: result.error || "Não foi possível carregar os dados do curso." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados do curso." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCourseData();
        }
    }, [user, id]);

    const handleLessonCompleted = (lessonId: string) => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons(prev => [...prev, lessonId]);
        }
    };

    const handlePurchase = async () => {
        if (!user || !course) return;

        if ((userProfile?.credits || 0) < (course.priceInCredits || 0)) {
            toast({
                variant: 'destructive',
                title: 'Créditos Insuficientes',
                description: 'Você não tem créditos suficientes para comprar este curso.',
                action: <ToastAction altText="Comprar Créditos" asChild><Link href="/billing">Comprar Créditos</Link></ToastAction>
            });
            return;
        }

        setIsPurchasing(true);
        try {
            const result = await purchaseCourse(course.id, user.uid);
            if (result.success) {
                toast({ title: 'Compra realizada com sucesso!', description: 'Você agora tem acesso total a este curso.' });
                await fetchCourseData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro na Compra", description: (error as Error).message });
        } finally {
            setIsPurchasing(false);
        }
    };
    
    const allLessonsFlat = useMemo(() => course?.modules.flatMap(m => m.lessons.map(l => l.id)) || [], [course]);
    const lastCompletedIndex = useMemo(() => {
        return allLessonsFlat.findLastIndex(lessonId => completedLessons.includes(lessonId))
    }, [allLessonsFlat, completedLessons]);


    if (loading) return <LoadingScreen />;

    if (!course) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Curso não encontrado</h1>
                <p className="text-muted-foreground">O curso que você está procurando não existe ou foi removido.</p>
                <Button asChild className="mt-4"><Link href="/courses">Voltar ao catálogo</Link></Button>
            </div>
        )
    }

    const totalCompleted = completedLessons.length;
    const progress = course.totalLessons > 0 ? Math.round((totalCompleted / course.totalLessons) * 100) : 0;

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                 <div className="mb-6">
                    <Link href="/courses" className="text-sm text-primary hover:underline mb-2 inline-block">&larr; Voltar para todos os cursos</Link>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">{course.title}</h1>
                    <p className="mt-2 text-muted-foreground">{course.description}</p>
                 </div>
                 {hasAccess ? (
                     <Card>
                        <CardHeader><CardTitle>Conteúdo do Curso</CardTitle></CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full" defaultValue={course.modules[0]?.id}>
                                {course.modules.map(module => (
                                    <AccordionItem key={module.id} value={module.id}>
                                        <AccordionTrigger className="font-bold text-lg hover:no-underline flex justify-between items-center w-full pr-4">
                                            <span>{module.title}</span>
                                            {module.badge?.name && (<Badge variant="secondary" className="flex items-center gap-1.5 bg-amber-100 text-amber-800 border-amber-200"><Award className="h-4 w-4" /><span>Medalha: {module.badge.name}</span></Badge>)}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="space-y-1 pt-2">
                                                {module.lessons.map(lesson => {
                                                    const lessonIndex = allLessonsFlat.indexOf(lesson.id);
                                                    const isLocked = lessonIndex > lastCompletedIndex + 1;
                                                    return (
                                                        <LessonItem key={lesson.id} lesson={lesson} course={course} isCompleted={completedLessons.includes(lesson.id)} onLessonCompleted={handleLessonCompleted} isLocked={isLocked}/>
                                                    );
                                                })}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                 ) : (
                    <Card className="text-center p-8">
                        <CardHeader>
                            <Lock className="mx-auto h-12 w-12 text-primary mb-4" />
                            <CardTitle className="text-2xl">Acesso Exclusivo</CardTitle>
                            <CardDescription>Compre este curso para desbloquear todo o conteúdo, incluindo aulas, materiais e o certificado de conclusão.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="text-4xl font-bold text-accent-foreground font-headline mb-4">
                                {course.priceInCredits} créditos
                            </div>
                            <Button size="lg" onClick={handlePurchase} disabled={isPurchasing}>
                                {isPurchasing ? <Loader2 className="mr-2 animate-spin" /> : <ShoppingCart className="mr-2"/>}
                                Comprar Curso
                            </Button>
                        </CardContent>
                    </Card>
                 )}
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-20">
                    <CardHeader>
                        <CardTitle>{hasAccess ? 'Seu Progresso' : 'Adquirir Curso'}</CardTitle>
                        <CardDescription>{hasAccess ? 'Continue de onde parou e conquiste seu certificado.' : `Invista ${course.priceInCredits} créditos na sua carreira.`}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {hasAccess ? (
                            <>
                                <Progress value={progress} />
                                <p className="text-sm text-muted-foreground">{progress}% concluído ({totalCompleted} de {course.totalLessons} aulas)</p>
                            </>
                        ) : (
                            <div className="p-4 text-center rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground">Preço</p>
                                <p className="text-3xl font-bold font-headline">{course.priceInCredits} créditos</p>
                            </div>
                        )}
                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="font-medium flex items-center gap-2"><Trophy /> Nível:</span><Badge variant="outline">{course.difficulty}</Badge></div>
                            <div className="flex justify-between"><span className="font-medium flex items-center gap-2"><BookOpen /> Aulas:</span><span>{course.totalLessons}</span></div>
                            <div className="flex justify-between"><span className="font-medium flex items-center gap-2"><Clock /> Duração:</span><span>{Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}min</span></div>
                        </div>
                        
                         {hasAccess ? (
                            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={progress === 100}>{progress === 100 ? "Curso Concluído!" : "Continuar Curso"}</Button>
                         ) : (
                            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handlePurchase} disabled={isPurchasing}>
                                 {isPurchasing ? <Loader2 className="mr-2 animate-spin" /> : <ShoppingCart className="mr-2"/>}
                                Comprar Agora
                            </Button>
                         )}

                        {hasAccess && progress === 100 && (<TooltipProvider><Tooltip><TooltipTrigger asChild><div className="w-full"><Button className="w-full" variant="outline" disabled><Lock className="mr-2 h-4 w-4"/> Baixar Certificado (Premium)</Button></div></TooltipTrigger><TooltipContent><p>Faça o upgrade para a versão Pro para emitir certificados.</p></TooltipContent></Tooltip></TooltipProvider>)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function LessonItem({ lesson, course, isCompleted, onLessonCompleted, isLocked }: { lesson: Lesson; course: Course; isCompleted: boolean; onLessonCompleted: (lessonId: string) => void; isLocked: boolean }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCompleteLesson = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
            return;
        }
        setCompletingLessonId(lesson.id);
        try {
            await markLessonAsComplete({ courseId: course.id, moduleId: course.modules.find(m => m.lessons.some(l => l.id === lesson.id))!.id, lessonId: lesson.id, userId: user.uid });
            onLessonCompleted(lesson.id);
            toast({ title: "Aula Concluída!", description: "Seu progresso foi salvo." });
            setIsDialogOpen(false);
        } catch (error) { toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar seu progresso." }); } finally { setCompletingLessonId(null); }
    };

    const lessonTriggerContent = (
        <div className={cn("flex items-center justify-between w-full p-3 rounded-md", isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-muted/50")}>
            <div className="flex items-center gap-4">
                {isLocked ? <Lock className="h-6 w-6 text-muted-foreground/30" /> : (isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground/50" />)}
                <div className="flex items-center gap-2">
                    {getLessonIcon(lesson.type)}
                    <span className={cn(isCompleted && "line-through text-muted-foreground", isLocked && "text-muted-foreground/50")}>{lesson.title}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4"/> {lesson.totalDuration} min</span>
            </div>
        </div>
    );

    if (isLocked) {
        return (
             <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild><div className="w-full">{lessonTriggerContent}</div></TooltipTrigger>
                    <TooltipContent><p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Complete as aulas anteriores para desbloquear.</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    
    // Verificar se a aula tem questões para mostrar o quiz
    if (lesson.questions && lesson.questions.length > 0) {
        return <li className="flex flex-col rounded-md p-3 hover:bg-muted/50"><QuizPlayer lesson={lesson} course={course} isCompleted={isCompleted} onLessonCompleted={onLessonCompleted} /></li>;
    }
    
    return (
        <li>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    {lessonTriggerContent}
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle className="font-headline text-2xl">{lesson.title}</DialogTitle>
                        <DialogDescription>Duração: {lesson.totalDuration} minutos. {course.authorInfo && <span className="flex items-center gap-1.5 text-xs mt-1"><Copyright/> {course.authorInfo}</span>}</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Conteúdo baseado em contentBlocks ou content */}
                        {lesson.contentBlocks && lesson.contentBlocks.length > 0 ? (
                            <ContentBlockPlayer blocks={lesson.contentBlocks} />
                        ) : lesson.content && (
                            <div className="prose prose-sm lg:prose-base max-w-none dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {lesson.content}
                                </ReactMarkdown>
                            </div>
                        )}

                        {lesson.materials && lesson.materials.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                                <h4 className="font-headline text-lg font-semibold mb-4">Material de Apoio</h4>
                                <ul className="space-y-2">
                                    {lesson.materials.map(material => (
                                        <li key={material.name}>
                                            {'url' in material ? (
                                                <Button asChild variant="outline" className="justify-start gap-2">
                                                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                                                        <Paperclip className="h-4 w-4" />
                                                        {material.name}
                                                    </a>
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{material.name}</span>
                                                    <span className="text-xs text-muted-foreground">(Arquivo não disponível)</span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                    <DialogFooter className="p-6 pt-4 border-t bg-muted/50 flex-col sm:flex-row items-center justify-between gap-4">
                        {course.legalNotice && (
                            <div className="text-xs text-muted-foreground flex-1 flex items-start gap-2">
                                <Gavel className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{course.legalNotice}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 self-end">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
                            <Button onClick={handleCompleteLesson} disabled={isCompleted || !!completingLessonId}>
                                {completingLessonId === lesson.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isCompleted ? <> <CheckCircle2 className="mr-2"/> Concluída</> : "Marcar como Concluída")}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </li>
    );
}

// Quiz Player Component
function QuizPlayer({ lesson, course, isCompleted, onLessonCompleted }: { lesson: Lesson; course: Course; isCompleted: boolean; onLessonCompleted: (lessonId: string) => void }) {
    const { user } = useAuth();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{ score: number, total: number, passed: boolean, correctAnswers: Record<string, string> } | null>(null);
    const { toast } = useToast();

    if (!lesson.questions || lesson.questions.length === 0) return null;

    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
            return;
        }

        const correctAnswers: Record<string, string> = {};
        let score = 0;
        lesson.questions?.forEach(q => {
            const correctOption = q.options.find(o => o.isCorrect);
            if (correctOption?.id) {
                correctAnswers[q.id] = correctOption.id;
                if (answers[q.id] === correctOption.id) {
                    score++;
                }
            }
        });
        
        const total = lesson.questions!.length;
        const percentage = (score / total) * 100;
        const passed = percentage >= (lesson.passingScore || 70);
        setResult({ score, total, passed, correctAnswers });
        
        if (passed) {
            toast({ title: "Prova Aprovada!", description: "Seu progresso foi salvo." });
            await markLessonAsComplete({ courseId: course.id, moduleId: course.modules.find(m => m.lessons.some(l => l.id === lesson.id))!.id, lessonId: lesson.id, userId: user.uid });
            onLessonCompleted(lesson.id);
        } else {
            toast({ variant: "destructive", title: "Não foi desta vez!", description: `Você precisa acertar pelo menos ${lesson.passingScore}% para ser aprovado.` });
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setResult(null);
    };

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground/50" />}
                    <div className="flex items-center gap-2">{getLessonIcon(lesson.type)}<span className={cn(isCompleted && "line-through text-muted-foreground")}>{lesson.title}</span></div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4"/> {lesson.totalDuration} min</span>
                </div>
            </div>
            <div className="ml-10 space-y-6 border-t border-dashed pt-4">
                {isCompleted && !result ? (
                    <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">Prova já concluída com sucesso.</div>
                ) : !result ? (
                    <>
                        {lesson.questions.map((q, index) => (
                            <div key={q.id} className="space-y-3">
                                <p className="font-semibold">({index + 1}) {q.question}</p>
                                <RadioGroup value={answers[q.id]} onValueChange={(value) => handleAnswerChange(q.id, value)}>
                                    {q.options.map(o => (
                                        <Label key={o.id} htmlFor={o.id} className="flex items-center gap-3 p-3 rounded-md border border-input has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
                                            <RadioGroupItem value={o.id} id={o.id} />
                                            <span>{o.text}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}
                        <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== lesson.questions.length}>Finalizar Prova</Button>
                    </>
                ) : (
                    <div className="space-y-6">
                        <Card className={cn("p-6", result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                            <CardHeader className="p-0 text-center">
                                <CardTitle className="text-2xl">{result.passed ? "Aprovado!" : "Tente Novamente"}</CardTitle>
                                <CardDescription>Você acertou {result.score} de {result.total} questões ({Math.round((result.score / result.total) * 100)}%).</CardDescription>
                            </CardHeader>
                        </Card>

                        <div className="space-y-3">
                            <h3 className="font-bold">Revisão da Prova</h3>
                            {lesson.questions.map((q, index) => (
                                <div key={q.id} className="p-4 rounded-md border">
                                    <p className="font-semibold">({index + 1}) {q.question}</p>
                                    <div className="mt-2 space-y-2 text-sm">
                                        {q.options.map(o => {
                                            const isUserAnswer = answers[q.id] === o.id;
                                            const isCorrectAnswer = result.correctAnswers[q.id] === o.id;
                                            return (
                                                <div key={o.id} className={cn(
                                                    "flex items-center gap-2 p-2 rounded",
                                                    isCorrectAnswer && "bg-green-100/80 text-green-900 font-medium",
                                                    isUserAnswer && !isCorrectAnswer && "bg-red-100/80 text-red-900 line-through"
                                                )}>
                                                    {isCorrectAnswer ? <CheckCircle2 className="h-4 w-4" /> : (isUserAnswer ? <XCircle className="h-4 w-4" /> : <Circle className="h-4 w-4 text-muted" />)}
                                                    <span>{o.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!result.passed && <Button onClick={handleRetry} variant="outline"><RefreshCw className="mr-2"/> Tentar Novamente</Button>}
                    </div>
                )}
            </div>
        </div>
    );
}

// Renderizador de blocos de conteúdo para o aluno
function ContentBlockPlayer({ blocks, onExerciseComplete, onQuizComplete }: {
  blocks: any[];
  onExerciseComplete?: (idx: number, correct: boolean) => void;
  onQuizComplete?: (idx: number, correct: boolean) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [exerciseResults, setExerciseResults] = useState<Record<number, boolean>>({});
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});
  const block = blocks[current];
  function next() { if (current < blocks.length - 1) setCurrent(c => c + 1); }
  function prev() { if (current > 0) setCurrent(c => c - 1); }
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-xs text-muted-foreground">Bloco {current + 1} de {blocks.length}</div>
        {block.type === 'heading' && <h2 className={`text-${block.level}xl font-bold`}>{block.text}</h2>}
        {block.type === 'paragraph' && <p>{block.text}</p>}
        {block.type === 'list' && <ul className="list-disc ml-6">{block.items.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>}
        {block.type === 'image' && <img src={block.url} alt={block.alt} className="rounded max-w-full" />}
        {block.type === 'exercise' && (
          <ExercisePlayer block={block} idx={current} onComplete={res => { setExerciseResults(r => ({ ...r, [current]: res })); onExerciseComplete?.(current, res); }} />
        )}
        {block.type === 'quiz' && (
          <InlineQuizPlayer block={block} idx={current} onComplete={res => { setQuizResults(r => ({ ...r, [current]: res })); onQuizComplete?.(current, res); }} />
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="button" variant="outline" onClick={prev} disabled={current === 0}>Anterior</Button>
        <Button type="button" variant="outline" onClick={next} disabled={current === blocks.length - 1}>Próximo</Button>
      </div>
    </div>
  );
}

function ExercisePlayer({ block, idx, onComplete }: { block: any, idx: number, onComplete: (correct: boolean) => void }) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  return (
    <div className="space-y-2">
      <div className="font-semibold">{block.question}</div>
      <input className="border rounded px-2 py-1 w-full" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Sua resposta" />
      <div className="flex gap-2 mt-2">
        <Button type="button" size="sm" onClick={() => { const ok = answer.trim().toLowerCase() === block.answer.trim().toLowerCase(); setResult(ok); onComplete(ok); }}>Verificar</Button>
        {result !== null && (result ? <span className="text-green-600 font-bold">Correto!</span> : <span className="text-red-600 font-bold">Incorreto.</span>)}
      </div>
      {block.hints && block.hints.length > 0 && <details className="mt-2"><summary className="cursor-pointer text-xs text-muted-foreground">Dica</summary><ul className="list-disc ml-6 text-xs">{block.hints.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul></details>}
    </div>
  );
}

function InlineQuizPlayer({ block, idx, onComplete }: { block: any, idx: number, onComplete: (correct: boolean) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<null | boolean>(null);
  const allAnswered = block.questions.every((q: any) => answers[q.id]);
  function handleSubmit() {
    let correct = true;
    block.questions.forEach((q: any) => {
      const correctOpt = q.options.find((o: any) => o.id === q.correctOptionId);
      if (!correctOpt || answers[q.id] !== correctOpt.id) correct = false;
    });
    setResult(correct);
    onComplete(correct);
  }
  return (
    <div className="space-y-4">
      {block.questions.map((q: any, i: number) => (
        <div key={q.id} className="mb-2">
          <div className="font-semibold">{q.question}</div>
          {q.options.map((opt: any) => (
            <label key={opt.id} className="flex items-center gap-2">
              <input type="radio" name={`quiz-${idx}-${q.id}`} value={opt.id} checked={answers[q.id] === opt.id} onChange={() => setAnswers(a => ({ ...a, [q.id]: opt.id }))} />
              {opt.text}
            </label>
          ))}
        </div>
      ))}
      <Button type="button" size="sm" onClick={handleSubmit} disabled={!allAnswered}>Verificar</Button>
      {result !== null && (result ? <span className="text-green-600 font-bold ml-2">Tudo correto!</span> : <span className="text-red-600 font-bold ml-2">Alguma resposta está incorreta.</span>)}
    </div>
  );
}
