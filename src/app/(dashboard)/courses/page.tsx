'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, MoveRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { type Course } from '@/lib/types';


// Mock data - Em uma aplicação real, isso viria do Firebase
const allCourses: Course[] = [
  {
    id: '1',
    title: "Legislação de Trânsito para Taxistas",
    description: "Domine as leis e regulamentos essenciais para operar em SP e evite multas.",
    category: "Legislação",
    totalLessons: 12,
    totalDuration: 150, // in minutes
    modules: [] // Omitido para simplicidade na listagem
  },
  {
    id: '2',
    title: "Inglês para Atendimento ao Turista",
    description: "Aprenda frases e vocabulário para se comunicar com estrangeiros com confiança.",
    category: "Atendimento",
    totalLessons: 25,
    totalDuration: 210,
    modules: []
  },
  {
    id: '3',
    title: "Direção Defensiva e Primeiros Socorros",
    description: "Técnicas avançadas para uma condução mais segura e noções de primeiros socorros.",
    category: "Segurança",
    totalLessons: 18,
    totalDuration: 180,
    modules: []
  },
  {
    id: '4',
    title: "Gestão Financeira para Autônomos",
    description: "Organize suas finanças, controle gastos e planeje seu futuro financeiro.",
    category: "Finanças",
    totalLessons: 10,
    totalDuration: 90,
    modules: []
  },
];


export default function CoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = useMemo(() => {
        return allCourses.filter(course => 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Catálogo de Cursos</h1>
            <p className="text-muted-foreground">Invista na sua carreira com nossos cursos especializados.</p>
        </div>

        <Card>
            <CardContent className="p-4">
                 <Input 
                  placeholder="Buscar por título ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map(course => (
                <Card key={course.id} className="flex flex-col">
                    <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">{course.category}</Badge>
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
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            <Link href={`/courses/${course.id}`}>Ver Curso <MoveRight className="ml-2"/></Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            {filteredCourses.length === 0 && (
                 <div className="col-span-full text-center text-muted-foreground py-16">
                    <p className="text-lg">Nenhum curso encontrado.</p>
                    <p>Tente ajustar seu termo de busca.</p>
                </div>
            )}
        </div>
    </div>
  );
}
