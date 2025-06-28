'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Course } from '@/lib/types';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, MoveRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';


export default function CoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesCollection = collection(db, 'courses');
                const q = query(coursesCollection, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setAllCourses(coursesData);
            } catch (error) {
                console.error("Error fetching courses: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        return allCourses.filter(course => 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allCourses]);

  if (loading) {
    return (
       <div className="flex flex-col gap-8">
            <div>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="mt-2 h-6 w-1/2" />
            </div>
            <Card><CardContent className="p-4"><Skeleton className="h-10 max-w-sm" /></CardContent></Card>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        </div>
    )
  }

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
                    <p>Tente ajustar seu termo de busca ou verifique mais tarde.</p>
                </div>
            )}
        </div>
    </div>
  );
}
