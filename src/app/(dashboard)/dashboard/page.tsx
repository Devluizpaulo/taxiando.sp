

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth, type UserProfile } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { type Course } from '@/lib/types';
import Link from 'next/link';
import { differenceInDays, isPast } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Briefcase, FileCheck, Search, Award, AlertTriangle, ShieldCheck, HelpCircle, UserPlus, Car, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingScreen } from '@/components/loading-screen';
import { getDriverApplications } from '@/app/actions/fleet-actions';


interface CourseWithProgress extends Course {
    progress: number;
}

// Helper to calculate profile completeness
const calculateProfileCompleteness = (profile: UserProfile | null): number => {
    if (!profile) return 0;

    const totalFields = 10;
    let filledFields = 0;

    if (profile.photoUrl) filledFields++;
    if (profile.bio && profile.bio.length > 10) filledFields++;
    if (profile.phone) filledFields++;
    if (profile.cnhNumber) filledFields++;
    if (profile.cnhCategory) filledFields++;
    if (profile.cnhExpiration) filledFields++;
    if (profile.condutaxNumber) filledFields++;
    if (profile.alvaraExpiration) filledFields++;
    if (profile.reference?.name) filledFields++;
    if (profile.financialConsent) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
};

// Helper to determine vehicle status based on work mode
const getVehicleStatus = (profile: UserProfile | null): { text: string; icon: React.ElementType; className: string, href: string } => {
    if (!profile) {
        return { text: 'Carregando...', icon: Loader2, className: 'animate-spin', href: '/profile' };
    }

    if (profile.workMode === 'owner') {
        if (!profile.vehicleLicensePlate) {
             return { text: 'Cadastre seu Veículo', icon: Car, className: 'text-muted-foreground', href: '/profile' };
        }
        const alvaraTimestamp = profile.alvaraExpiration;
        if (!alvaraTimestamp) {
            return { text: 'Alvará Pendente', icon: HelpCircle, className: 'text-muted-foreground', href: '/profile' };
        }
        const alvaraDate = (alvaraTimestamp as unknown as Timestamp).toDate();
        if (isPast(alvaraDate)) {
            return { text: 'Alvará Vencido', icon: AlertTriangle, className: 'text-destructive', href: '/profile' };
        }
        const daysRemaining = differenceInDays(alvaraDate, new Date());
        if (daysRemaining <= 30) {
            return { text: `Vence em ${daysRemaining}d`, icon: AlertTriangle, className: 'text-amber-600', href: '/profile' };
        }
        return { text: 'Regular', icon: ShieldCheck, className: 'text-primary', href: '/profile' };
    } else { // 'rental' or undefined
        return { text: 'Buscar Vagas', icon: Briefcase, className: 'text-primary', href: '/rentals' };
    }
};


export default function DashboardPage() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [inProgressCourses, setInProgressCourses] = useState<CourseWithProgress[]>([]);
    const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
    const [applicationsCount, setApplicationsCount] = useState(0);

    const profileCompleteness = useMemo(() => calculateProfileCompleteness(userProfile), [userProfile]);
    const vehicleStatus = useMemo(() => getVehicleStatus(userProfile), [userProfile]);

    const progressColor = useMemo(() => {
        if (profileCompleteness < 50) return 'bg-red-500';
        if (profileCompleteness < 90) return 'bg-yellow-500';
        return 'bg-green-500';
    }, [profileCompleteness]);


    useEffect(() => {
        if (!user) return;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch applications and course progress in parallel
                const progressCollectionRef = collection(db, 'users', user.uid, 'progress');
                const [progressSnapshot, applications] = await Promise.all([
                    getDocs(progressCollectionRef),
                    getDriverApplications(user.uid),
                ]);

                setApplicationsCount(applications.length);
                
                const userInProgress: CourseWithProgress[] = [];
                let userCompletedCount = 0;

                if (!progressSnapshot.empty) {
                    const coursePromises = progressSnapshot.docs.map(async (progressDoc) => {
                        const courseId = progressDoc.id;
                        const courseDocRef = doc(db, 'courses', courseId);
                        const courseDoc = await getDoc(courseDocRef);

                        if (courseDoc.exists()) {
                            const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
                            const progressData = progressDoc.data();
                            const completedLessons = progressData.completedLessons || [];
                            const progressPercentage = courseData.totalLessons > 0 ? Math.round((completedLessons.length / courseData.totalLessons) * 100) : 0;
                            
                            if (progressPercentage < 100) {
                                userInProgress.push({ ...courseData, progress: progressPercentage });
                            } else {
                                userCompletedCount++;
                            }
                        }
                    });
                    await Promise.all(coursePromises);
                }
                
                setInProgressCourses(userInProgress);
                setCompletedCoursesCount(userCompletedCount);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (authLoading || loading) {
        return <LoadingScreen />;
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Olá, {userProfile?.name?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Sua central de controle para acelerar sua carreira.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><Link href="/courses"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Cursos em Andamento</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{inProgressCourses.length}</div></CardContent></Link></Card>
                <Card><Link href="/courses"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Cursos Concluídos</CardTitle><FileCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{completedCoursesCount}</div></CardContent></Link></Card>
                <Card><Link href="/applications"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Candidaturas</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{applicationsCount}</div></CardContent></Link></Card>
                <Card>
                    <Link href={vehicleStatus.href}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {userProfile?.workMode === 'owner' ? 'Meu Veículo' : 'Oportunidades'}
                            </CardTitle>
                            <vehicleStatus.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={cn("text-2xl font-bold", vehicleStatus.className)}>
                                {vehicleStatus.text}
                            </div>
                             <p className="text-xs text-muted-foreground">
                              {userProfile?.workMode === 'owner' ? 'Monitore documentos e mais.' : 'Encontre seu próximo carro.'}
                            </p>
                        </CardContent>
                    </Link>
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
                            <CardTitle>Força do Perfil</CardTitle>
                            <CardDescription>Um perfil completo aumenta suas chances em até 40%.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress value={profileCompleteness} indicatorClassName={progressColor} />
                            <p className="text-sm text-muted-foreground">{profileCompleteness}% completo</p>
                            {profileCompleteness < 100 && (
                                <Button asChild className="w-full">
                                    <Link href="/profile">
                                        <UserPlus className="mr-2" /> Completar Perfil
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ações Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/courses"><BookOpen className="mr-2" /> Ver todos os Cursos</Link>
                            </Button>
                            <Button asChild variant="outline" className="justify-start">
                                <Link href="/rentals"><Search className="mr-2" /> Buscar Oportunidades</Link>
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

    
}
