'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Circle, Clock, PlayCircle, FileText, Award, Paperclip } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type Course, type Lesson } from "@/lib/types";

// Mock data - Em uma aplicação real, isso viria do Firebase
const courseData: Course = {
    id: '1',
    title: "Legislação de Trânsito para Taxistas",
    description: "Um curso completo sobre as leis, regulamentos e resoluções mais importantes para taxistas que operam na cidade de São Paulo. Mantenha-se atualizado e evite multas.",
    category: "Legislação",
    totalLessons: 12,
    totalDuration: 150, // em minutos
    modules: [
        {
            id: 'm1',
            title: "Módulo 1: Introdução à Legislação",
            badge: { name: "Pioneiro da Lei", iconUrl: "" },
            lessons: [
                { id: 'l1-1', title: "O Código de Trânsito Brasileiro (CTB)", type: "video", duration: 15, isCompleted: true, supportingMaterials: [{name: "Resumo do CTB.pdf", url: "#"}] },
                { id: 'l1-2', title: "Hierarquia das Leis de Trânsito", type: "text", duration: 10, isCompleted: true },
                { id: 'l1-3', title: "Quiz - Módulo 1", type: "quiz", duration: 5, isCompleted: false },
            ]
        },
        {
            id: 'm2',
            title: "Módulo 2: Regulamentação do Táxi em SP",
            lessons: [
                { id: 'l2-1', title: "Decreto Municipal nº 56.981/2016", type: "video", duration: 20, isCompleted: false },
                { id: 'l2-2', title: "Uso do Taxímetro e Tarifas", type: "text", duration: 10, isCompleted: false },
                { id: 'l2-3', title: "Condutas e Deveres do Taxista", type: "text", duration: 15, isCompleted: false },
            ]
        },
        {
            id: 'm3',
            title: "Módulo 3: Infrações e Penalidades",
            badge: { name: "Expert em Multas", iconUrl: "" },
            lessons: [
                { id: 'l3-1', title: "Tipos de Infração (Leve, Média, Grave, Gravíssima)", type: "video", duration: 15, isCompleted: false, supportingMaterials: [{name: "Tabela de Infrações.xlsx", url: "#"}, {name: "Guia de Recursos.pdf", url: "#"}] },
                { id: 'l3-2', title: "Processo de Suspensão e Cassação da CNH", type: "video", duration: 18, isCompleted: false },
                { id: 'l3-3', title: "Recursos de Multas: Como proceder", type: "text", duration: 12, isCompleted: false },
                { id: 'l3-4', title: "Quiz - Módulo 3", type: "quiz", duration: 5, isCompleted: false },
            ]
        }
    ]
};

const getLessonIcon = (type: Lesson['type']) => {
    switch(type) {
        case 'video': return <PlayCircle className="h-5 w-5 text-muted-foreground" />;
        case 'text': return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'quiz': return <BookOpen className="h-5 w-5 text-muted-foreground" />;
    }
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
    // Em uma aplicação real, você usaria o `params.id` para buscar os dados do curso no Firebase
    const course = courseData;

    const completedLessons = course.modules.flatMap(m => m.lessons).filter(l => l.isCompleted).length;
    const progress = Math.round((completedLessons / course.totalLessons) * 100);

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
                        <Accordion type="single" collapsible className="w-full" defaultValue="m1">
                            {course.modules.map(module => (
                                <AccordionItem key={module.id} value={module.id}>
                                    <AccordionTrigger className="font-bold text-lg hover:no-underline flex justify-between items-center w-full pr-4">
                                        <span>{module.title}</span>
                                        {module.badge && (
                                            <Badge variant="secondary" className="flex items-center gap-1.5 bg-amber-100 text-amber-800 border-amber-200">
                                                <Award className="h-4 w-4" />
                                                <span>Medalha: {module.badge.name}</span>
                                            </Badge>
                                        )}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-1 pt-2">
                                            {module.lessons.map(lesson => (
                                                <li key={lesson.id} className="flex flex-col rounded-md p-3 hover:bg-muted/50">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-4">
                                                            {lesson.isCompleted ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground/50" />}
                                                            <div className="flex items-center gap-2">
                                                                {getLessonIcon(lesson.type)}
                                                                <span className={cn(lesson.isCompleted && "line-through text-muted-foreground")}>{lesson.title}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-4 w-4"/> {lesson.duration} min
                                                            </span>
                                                            <Button variant="outline" size="sm">
                                                                {lesson.isCompleted ? "Revisar" : "Iniciar"}
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
                                                                            <a href={material.url} download>
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
                    <CardHeader>
                        <CardTitle>Seu Progresso</CardTitle>
                         <CardDescription>
                            Continue de onde parou e conquiste seu certificado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Progress value={progress} />
                        <p className="text-sm text-muted-foreground">{progress}% concluído ({completedLessons} de {course.totalLessons} aulas)</p>
                        
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