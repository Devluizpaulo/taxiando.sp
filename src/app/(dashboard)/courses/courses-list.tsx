

'use client';

import { useState, useMemo } from 'react';
import { type Course } from '@/lib/types';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, MoveRight, CreditCard, Trophy } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CoursesList({ courses }: { courses: Course[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('Todos');

    const difficultyLevels = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const searchMatch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                course.category.toLowerCase().includes(searchTerm.toLowerCase());
            const difficultyMatch = difficultyFilter === 'Todos' || course.difficulty === difficultyFilter;
            
            return searchMatch && difficultyMatch;
        });
    }, [searchTerm, difficultyFilter, courses]);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Catálogo de Cursos</h1>
            <p className="text-muted-foreground">Invista na sua carreira com nossos cursos especializados.</p>
        </div>

        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                 <Input 
                  placeholder="Buscar por título ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:max-w-sm"
                />
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Nível..." />
                    </SelectTrigger>
                    <SelectContent>
                        {difficultyLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map(course => (
                <Card key={course.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center mb-2">
                           <Badge variant="secondary" className="w-fit">{course.category}</Badge>
                           {course.difficulty && <Badge variant="outline" className="capitalize flex items-center gap-1"><Trophy className="h-3 w-3" /> {course.difficulty}</Badge>}
                        </div>
                        <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                             <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.totalLessons} aulas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Aprox. {Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}min</span>
                            </div>
                             <div className="flex items-center gap-2 pt-2 border-t mt-2">
                                <CreditCard className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-foreground">
                                    {(course.priceInCredits || 0) > 0 ? `${course.priceInCredits} créditos` : 'Gratuito'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                             <Link href={`/courses/${course.id}`}>
                                {(course.priceInCredits || 0) > 0 ? 'Comprar Curso' : 'Acessar Curso'} <MoveRight className="ml-2"/>
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            {filteredCourses.length === 0 && (
                 <div className="col-span-full text-center text-muted-foreground py-16">
                    <p className="text-lg">Nenhum curso encontrado.</p>
                    <p>Tente ajustar seu termo de busca ou verifique mais tarde.</p>
                </div>
            )}
        </div>
    </div>
  );
}
