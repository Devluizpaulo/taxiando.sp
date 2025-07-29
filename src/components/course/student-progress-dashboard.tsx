'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
    BookOpen, 
    CheckCircle, 
    Circle, 
    Clock, 
    Play, 
    ThumbsUp, 
    ThumbsDown, 
    MessageSquare,
    Award,
    BarChart3
} from 'lucide-react';
import { type Course, type Module, type Lesson } from '@/lib/types';

interface StudentProgress {
    courseId: string;
    completedLessons: string[];
    currentModule: string;
    currentLesson: string;
    progress: number;
    lastAccessed: Date;
    certificateEarned?: boolean;
    certificateUrl?: string;
}

interface StudentProgressDashboardProps {
    course: Course;
    studentProgress: StudentProgress;
    onLessonComplete: (lessonId: string) => void;
    onLessonFeedback: (lessonId: string, feedback: 'thumbsUp' | 'thumbsDown', comment?: string) => void;
}

export function StudentProgressDashboard({ 
    course, 
    studentProgress, 
    onLessonComplete, 
    onLessonFeedback 
}: StudentProgressDashboardProps) {
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [feedbackComments, setFeedbackComments] = useState<Record<string, string>>({});

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const isLessonCompleted = (lessonId: string) => {
        return studentProgress.completedLessons.includes(lessonId);
    };

    const getModuleProgress = (module: Module) => {
        const completedLessons = module.lessons.filter(lesson => 
            isLessonCompleted(lesson.id)
        ).length;
        return (completedLessons / module.lessons.length) * 100;
    };

    const getCourseProgress = () => {
        const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        const completedLessons = studentProgress.completedLessons.length;
        return (completedLessons / totalLessons) * 100;
    };

    const formatDuration = (minutes: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
        }
        return `${mins}min`;
    };

    const handleFeedback = (lessonId: string, type: 'thumbsUp' | 'thumbsDown') => {
        onLessonFeedback(lessonId, type, feedbackComments[lessonId]);
        setFeedbackComments(prev => ({ ...prev, [lessonId]: '' }));
    };

    return (
        <div className="space-y-6">
            {/* Header com progresso geral */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                {course.title}
                            </CardTitle>
                            <CardDescription>
                                Seu progresso no curso
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{Math.round(getCourseProgress())}%</div>
                            <div className="text-sm text-muted-foreground">
                                {studentProgress.completedLessons.length} de {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas
                            </div>
                        </div>
                    </div>
                    <Progress value={getCourseProgress()} className="mt-4" />
                </CardHeader>
            </Card>

            {/* Certificado se disponível */}
            {studentProgress.certificateEarned && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold text-green-800">Parabéns! Você completou o curso!</h3>
                                <p className="text-sm text-green-700">Seu certificado está disponível para download.</p>
                            </div>
                            {studentProgress.certificateUrl && (
                                <Button variant="outline" size="sm" className="ml-auto">
                                    <Award className="mr-2 h-4 w-4" />
                                    Baixar Certificado
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de módulos */}
            <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => {
                    const moduleProgress = getModuleProgress(module);
                    const isExpanded = expandedModules.has(module.id);
                    
                    return (
                        <Card key={module.id}>
                            <CardHeader 
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleModule(module.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Módulo {moduleIndex + 1}
                                            </span>
                                            {moduleProgress === 100 && (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{module.title}</CardTitle>
                                            <CardDescription>
                                                {module.lessons.length} aulas • {formatDuration(module.lessons.reduce((acc, l) => acc + l.duration, 0))}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{Math.round(moduleProgress)}%</div>
                                            <Progress value={moduleProgress} className="w-20 h-2" />
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            {isExpanded ? '−' : '+'}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            {isExpanded && (
                                <CardContent>
                                    <div className="space-y-3">
                                        {module.lessons.map((lesson, lessonIndex) => {
                                            const isCompleted = isLessonCompleted(lesson.id);
                                            const isCurrent = lesson.id === studentProgress.currentLesson;
                                            
                                            return (
                                                <div key={lesson.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {lessonIndex + 1}
                                                                </span>
                                                                {isCompleted ? (
                                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium">{lesson.title}</h4>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDuration(lesson.duration)}
                                                                    {lesson.type && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {lesson.type}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isCurrent && (
                                                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                                    Atual
                                                                </Badge>
                                                            )}
                                                            <Button 
                                                                variant={isCompleted ? "outline" : "default"}
                                                                size="sm"
                                                                onClick={() => !isCompleted && onLessonComplete(lesson.id)}
                                                                disabled={isCompleted}
                                                            >
                                                                {isCompleted ? (
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                ) : (
                                                                    <Play className="mr-2 h-4 w-4" />
                                                                )}
                                                                {isCompleted ? 'Concluída' : 'Iniciar'}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Feedback da aula */}
                                                    {isCompleted && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-sm font-medium">Esta aula foi útil?</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleFeedback(lesson.id, 'thumbsUp')}
                                                                >
                                                                    <ThumbsUp className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleFeedback(lesson.id, 'thumbsDown')}
                                                                >
                                                                    <ThumbsDown className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Deixe um comentário (opcional)..."
                                                                    value={feedbackComments[lesson.id] || ''}
                                                                    onChange={(e) => setFeedbackComments(prev => ({
                                                                        ...prev,
                                                                        [lesson.id]: e.target.value
                                                                    }))}
                                                                    className="flex-1 text-sm px-2 py-1 border rounded"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleFeedback(lesson.id, 'thumbsUp')}
                                                                >
                                                                    <MessageSquare className="mr-2 h-3 w-3" />
                                                                    Enviar
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Estatísticas do aluno */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Suas Estatísticas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {studentProgress.completedLessons.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Aulas Concluídas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {Math.round(getCourseProgress())}%
                            </div>
                            <div className="text-sm text-muted-foreground">Progresso Geral</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {formatDuration(course.modules.reduce((acc, m) => acc + m.lessons.reduce((acc2, l) => acc2 + l.duration, 0), 0))}
                            </div>
                            <div className="text-sm text-muted-foreground">Duração Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {studentProgress.certificateEarned ? 'Sim' : 'Não'}
                            </div>
                            <div className="text-sm text-muted-foreground">Certificado</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}