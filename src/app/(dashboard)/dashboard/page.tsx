
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { type Course, type Badge } from '@/lib/types';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Briefcase, Car, FileCheck, Search, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseWithProgress extends Course {
    progress: number;
}

export default function DashboardPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [inProgressCourses, setInProgressCourses] = useState<CourseWithProgress[]>([]);
    const [completedCoursesCount, setCompletedCoursesCount] = useState(0);

    useEffect(() => {
        if (authLoading || !user || !userProfile) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch all courses
                const coursesSnapshot = await getDocs(collection(db, 'courses'));
                const allCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));

                // Fetch user progress for all courses
                const progressPromises = allCourses.map(course => 
                    getDoc(doc(db, 'users', user.uid, 'progress', course.id))
                );
                const progressSnapshots = await Promise.all(progressPromises);

                const userInProgress: CourseWithProgress[] = [];
                let userCompletedCount = 0;

                progressSnapshots.forEach((progressSnap, index) => {
                    if (progressSnap.exists()) {
                        const course = allCourses[index];
                        const progressData = progressSnap.data();
                        const completedLessons = progressData.completedLessons || [];
                        const progressPercentage = Math.round((completedLessons.length / course.totalLessons) * 100);

                        if (progressPercentage < 100) {
                            userInProgress.push({ ...course, progress: progressPercentage });
                        } else {
                            userCompletedCount++;
                        }
                    }
                });
                
                setInProgressCourses(userInProgress);
                setCompletedCoursesCount(userCompletedCount);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, userProfile, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="flex flex-col gap-8">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                 <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                           <Skeleton className="h-52" />
                           <Skeleton className="h-52" />
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                       <Skeleton className="h-48" />
                       <Skeleton className="h-64" />
                    </div>
                 </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Olá, {userProfile?.name?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Sua central de controle para acelerar sua carreira.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos em Andamento</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{inProgressCourses.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Concluídos</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{completedCoursesCount}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Candidaturas</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">4</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status do Veículo</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold text-primary">OK</div></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="font-headline text-2xl font-semibold mb-4">Meus Cursos em Andamento</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {inProgressCourses.map((course) => (
                            <Card key={course.id}>
                                <CardHeader>
                                    <CardTitle className="font-headline text-lg">{course.title}</CardTitle>
                                    <CardDescription className="pt-1 text-xs">{course.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Progress value={course.progress} className="w-full" />
                                    <p className="text-sm text-muted-foreground mt-2">{course.progress}% completo</p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="outline" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                        <Link href={`/courses/${course.id}`}>Continuar Curso</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                        {inProgressCourses.length === 0 && (
                            <Card className="sm:col-span-2 flex flex-col items-center justify-center py-12 text-center">
                                <CardHeader>
                                    <CardTitle>Nenhum curso em andamento</CardTitle>
                                    <CardDescription>Que tal começar um novo desafio?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild><Link href="/courses">Ver Catálogo de Cursos</Link></Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/courses"><BookOpen className="mr-2" /> Ver todos os Cursos</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/opportunities"><Search className="mr-2" /> Buscar Oportunidades</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/applications"><FileCheck className="mr-2" /> Minhas Candidaturas</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Minhas Conquistas</CardTitle>
                            <CardDescription>Medalhas que você ganhou ao concluir módulos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {userProfile?.earnedBadges && userProfile.earnedBadges.length > 0 ? (
                                <ul className="space-y-4">
                                    {userProfile.earnedBadges.map((badge) => (
                                        <li key={badge.name} className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                                                <Award className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{badge.name}</p>
                                                <p className="text-sm text-muted-foreground">Conquistada!</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-center text-muted-foreground py-4">Complete módulos para ganhar medalhas!</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );

    