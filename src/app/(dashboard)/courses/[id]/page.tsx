'use client'

import { useEffect, useState } from 'react';
import Link from "next/link";
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { markLessonAsComplete } from '@/app/actions/course-actions';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, CheckCircle2, Circle, Clock, PlayCircle, FileText, Award, Paperclip, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { type Course, type Lesson } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';


const getLessonIcon = (type: Lesson['type']) => {
    switch(type) {
        case 'video': return <PlayCircle className="h-5 w-5 text-muted-foreground" />;
        case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'quiz': return <BookOpen className="h-5 w-5 text-muted-foreground" />;
    }
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);

    const fetchCourseAndProgress = async () => {
        if (!user) return;

        try {
            // Fetch course data
            const courseDocRef = doc(db, 'courses', params.id);
            const courseDoc = await getDoc(courseDocRef);
            if (courseDoc.exists()) {
                setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
            }

            // Fetch user progress for this course
            const progressDocRef = doc(db, 'users', user.uid, 'progress', params.id);
            const progressDoc = await getDoc(progressDocRef);
            if (progressDoc.exists()) {
                setCompletedLessons(progressDoc.data().completedLessons || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
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

    const handleCompleteLesson = async (moduleId: string, lessonId: string) => {
        if (!user || !course) return;
        setCompletingLessonId(lessonId);
        try {
            await markLessonAsComplete({ courseId: course.id, moduleId, lessonId });
            setCompletedLessons(prev => [...prev, lessonId]);
            toast({ title: "Aula Concluída!", description: "Seu progresso foi salvo." });
        } catch (error) {
            console.error("Error completing lesson:", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar seu progresso." });
        } finally {
            setCompletingLessonId(null);
        }
    };

    if (loading) {
        return (
             <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Card><CardHeader><Skeleton className="h-80 w-full" /></CardHeader></Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="sticky top-20"><CardHeader><Skeleton className="h-64 w-full" /></CardHeader></Card>
                </div>
            </div>
        )
    }

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
                    <Link href="/courses" className="text-sm text-primary hover:underline mb-2 inline-block">
                        &larr; Voltar para todos os cursos
                    </Link>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">{course.title}</h1>
                    <p className="mt-2 text-muted-foreground">{course.description}</p>
                 </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Conteúdo do Curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full" defaultValue={course.modules[0]?.id}>
                            {course.modules.map(module => (
                                <AccordionItem key={module.id} value={module.id}>
                                    <AccordionTrigger className="font-bold text-lg hover:no-underline flex justify-between items-center w-full pr-4">
                                        <span>{module.title}</span>
                                        {module.badge?.name && (
                                            <Badge variant="secondary" className="flex items-center gap-1.5 bg-amber-100 text-amber-800 border-amber-200">
                                                <Award className="h-4 w-4" />
                                                <span>Medalha: {module.badge.name}</span>
                                            </Badge>
                                        )}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-1 pt-2">
                                            {module.lessons.map(lesson => {
                                                const isCompleted = completedLessons.includes(lesson.id);
                                                return (
                                                <li key={lesson.id} className="flex flex-col rounded-md p-3 hover:bg-muted/50">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-4">
                                                            {isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground/50" />}
                                                            <div className="flex items-center gap-2">
                                                                {getLessonIcon(lesson.type)}
                                                                <span className={cn(isCompleted && "line-through text-muted-foreground")}>{lesson.title}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-4 w-4"/> {lesson.duration} min
                                                            </span>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleCompleteLesson(module.id, lesson.id)}
                                                                disabled={isCompleted || completingLessonId === lesson.id}
                                                            >
                                                                {completingLessonId === lesson.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                {isCompleted ? "Revisar" : "Concluir"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {lesson.supportingMaterials && lesson.supportingMaterials.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-dashed ml-10">
                                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Material de Apoio</h4>
                                                            <ul className="space-y-1">
                                                                {lesson.supportingMaterials.map(material => (
                                                                    <li key={material.name}>
                                                                        <Button asChild variant="link" className="p-0 h-auto font-normal text-primary">
                                                                            <a href={material.url} target="_blank" rel="noopener noreferrer">
                                                                                <Paperclip className="h-4 w-4 mr-2" />
                                                                                {material.name}
                                                                            </a>
                                                                        </Button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </li>
                                            )})}
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
                    <CardHeader>
                        <CardTitle>Seu Progresso</CardTitle>
                         <CardDescription>
                            Continue de onde parou e conquiste seu certificado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={progress} />
                        <p className="text-sm text-muted-foreground">{progress}% concluído ({totalCompleted} de {course.totalLessons} aulas)</p>
                        
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Categoria:</span>
                                <Badge variant="secondary">{course.category}</Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Total de Aulas:</span>
                                <span>{course.totalLessons}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Duração Estimada:</span>
                                <span>{Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}min</span>
                            </div>
                        </div>

                         <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={progress === 100}>
                            {progress === 100 ? "Curso Concluído!" : "Continuar Curso"}
                         </Button>
                         {progress === 100 && (
                             <Button className="w-full" variant="outline">Baixar Certificado</Button>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
