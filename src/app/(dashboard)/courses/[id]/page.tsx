
'use client'

import { useEffect, useState } from 'react';
import Link from "next/link";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { markLessonAsComplete } from '@/app/actions/course-actions';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Circle, Clock, PlayCircle, FileText, Award, Paperclip, Loader2, Lock, ClipboardCheck, AlertTriangle, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { type Course, type Lesson, type QuizQuestion } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LoadingScreen } from '@/components/loading-screen';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const getLessonIcon = (type: Lesson['type']) => {
    switch(type) {
        case 'video': return <PlayCircle className="h-5 w-5 text-muted-foreground" />;
        case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'quiz': return <ClipboardCheck className="h-5 w-5 text-muted-foreground" />;
    }
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourseAndProgress = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const courseDocRef = doc(db, 'courses', params.id);
            const progressDocRef = doc(db, 'users', user.uid, 'progress', params.id);
            const [courseDoc, progressDoc] = await Promise.all([getDoc(courseDocRef), getDoc(progressDocRef)]);

            if (courseDoc.exists()) setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
            if (progressDoc.exists()) setCompletedLessons(progressDoc.data().completedLessons || []);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados do curso." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCourseAndProgress();
        }
    }, [user, params.id]);

    const handleLessonCompleted = (lessonId: string) => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons(prev => [...prev, lessonId]);
        }
    };

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
    const progress = Math.round((totalCompleted / course.totalLessons) * 100);

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                 <div className="mb-6">
                    <Link href="/courses" className="text-sm text-primary hover:underline mb-2 inline-block">&larr; Voltar para todos os cursos</Link>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">{course.title}</h1>
                    <p className="mt-2 text-muted-foreground">{course.description}</p>
                 </div>
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
                                            {module.lessons.map(lesson => (
                                                <LessonItem key={lesson.id} lesson={lesson} moduleId={module.id} courseId={course.id} isCompleted={completedLessons.includes(lesson.id)} onLessonCompleted={handleLessonCompleted} />
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-20">
                    <CardHeader><CardTitle>Seu Progresso</CardTitle><CardDescription>Continue de onde parou e conquiste seu certificado.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={progress} /><p className="text-sm text-muted-foreground">{progress}% concluído ({totalCompleted} de {course.totalLessons} aulas)</p>
                        <div className="border-t pt-4 space-y-2"><div className="flex justify-between text-sm"><span className="font-medium">Categoria:</span><Badge variant="secondary">{course.category}</Badge></div><div className="flex justify-between text-sm"><span className="font-medium">Total de Aulas:</span><span>{course.totalLessons}</span></div><div className="flex justify-between text-sm"><span className="font-medium">Duração Estimada:</span><span>{Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}min</span></div></div>
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={progress === 100}>{progress === 100 ? "Curso Concluído!" : "Continuar Curso"}</Button>
                        {progress === 100 && (<TooltipProvider><Tooltip><TooltipTrigger asChild><div className="w-full"><Button className="w-full" variant="outline" disabled><Lock className="mr-2 h-4 w-4"/> Baixar Certificado (Premium)</Button></div></TooltipTrigger><TooltipContent><p>Faça o upgrade para a versão Pro para emitir certificados.</p></TooltipContent></Tooltip></TooltipProvider>)}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Lesson Item Component
function LessonItem({ lesson, moduleId, courseId, isCompleted, onLessonCompleted }: { lesson: Lesson, moduleId: string, courseId: string, isCompleted: boolean, onLessonCompleted: (lessonId: string) => void }) {
    const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
    const { toast } = useToast();
    const handleCompleteLesson = async () => {
        setCompletingLessonId(lesson.id);
        try {
            await markLessonAsComplete({ courseId, moduleId, lessonId: lesson.id });
            onLessonCompleted(lesson.id);
            toast({ title: "Aula Concluída!", description: "Seu progresso foi salvo." });
        } catch (error) { toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar seu progresso." }); } finally { setCompletingLessonId(null); }
    };

    return (
        <li className="flex flex-col rounded-md p-3 hover:bg-muted/50">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground/50" />}
                    <div className="flex items-center gap-2">{getLessonIcon(lesson.type)}<span className={cn(isCompleted && "line-through text-muted-foreground")}>{lesson.title}</span></div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4"/> {lesson.duration} min</span>
                    {lesson.type !== 'quiz' && <Button variant="outline" size="sm" onClick={handleCompleteLesson} disabled={isCompleted || !!completingLessonId}>{completingLessonId === lesson.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isCompleted ? "Revisar" : "Concluir")}</Button>}
                </div>
            </div>
            {lesson.type === 'quiz' ? (<QuizPlayer lesson={lesson} courseId={courseId} moduleId={moduleId} isCompleted={isCompleted} onLessonCompleted={onLessonCompleted} />) : (lesson.supportingMaterials && lesson.supportingMaterials.length > 0 && (<div className="mt-4 pt-3 border-t border-dashed ml-10"><h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Material de Apoio</h4><ul className="space-y-1">{lesson.supportingMaterials.map(material => (<li key={material.name}><Button asChild variant="link" className="p-0 h-auto font-normal text-primary"><a href={material.url} target="_blank" rel="noopener noreferrer"><Paperclip className="h-4 w-4 mr-2" />{material.name}</a></Button></li>))}</ul></div>))}
        </li>
    );
}

// Quiz Player Component
function QuizPlayer({ lesson, courseId, moduleId, isCompleted, onLessonCompleted }: { lesson: Lesson, courseId: string, moduleId: string, isCompleted: boolean, onLessonCompleted: (lessonId: string) => void }) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{ score: number, total: number, passed: boolean, correctAnswers: Record<string, string> } | null>(null);
    const { toast } = useToast();

    if (!lesson.questions || lesson.questions.length === 0) return null;

    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        const correctAnswers: Record<string, string> = {};
        let score = 0;
        lesson.questions?.forEach(q => {
            const correctOption = q.options.find(o => o.isCorrect);
            if (correctOption) {
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
            await markLessonAsComplete({ courseId, moduleId, lessonId: lesson.id });
            onLessonCompleted(lesson.id);
        } else {
            toast({ variant: "destructive", title: "Não foi desta vez!", description: `Você precisa acertar pelo menos ${lesson.passingScore}% para ser aprovado.` });
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setResult(null);
    };

    if (isCompleted && !result) {
        return <div className="mt-4 ml-10 p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">Prova já concluída com sucesso.</div>;
    }

    return (
        <div className="mt-4 pt-3 border-t border-dashed ml-10 space-y-6">
            {!result ? (
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
                                                isCorrectAnswer && "bg-green-100/80 text-green-900",
                                                isUserAnswer && !isCorrectAnswer && "bg-red-100/80 text-red-900"
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
    );
}
