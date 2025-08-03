
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { type Course } from '@/lib/types';
import { updateCourseStatus, deleteCourse } from '@/app/actions/course-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, BookCopy, BarChart2, Loader2, Trash2, Eye, EyeOff, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CoursesClientPage({ initialCourses }: { initialCourses: Course[] }) {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const { toast } = useToast();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const totalStudents = courses.reduce((acc, c) => acc + (c.students || 0), 0);
    const totalRevenue = courses.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const publishedCourses = courses.filter(c => c.status === 'Published').length;
    const draftCourses = courses.filter(c => c.status === 'Draft').length;
    const archivedCourses = courses.filter(c => c.status === 'Archived').length;

    const handleStatusToggle = async (course: Course) => {
        setUpdatingId(course.id);
        const newStatus = course.status === 'Published' ? 'Draft' : 'Published';
        const result = await updateCourseStatus(course.id, newStatus);
        if (result.success) {
            toast({
                title: 'Status do Curso Atualizado!',
                description: `O curso "${course.title}" agora está como ${newStatus === 'Published' ? 'Publicado' : 'Rascunho'}.`,
            });
            setCourses(courses.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.error });
        }
        setUpdatingId(null);
    };

    const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
        const result = await deleteCourse(courseId);
        if (result.success) {
            toast({ title: 'Curso Removido!', description: `O curso "${courseTitle}" foi removido com sucesso.` });
            setCourses(courses.filter(c => c.id !== courseId));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Remover', description: result.error });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Published':
                return <Badge variant="default" className="bg-green-100 text-green-800">Publicado</Badge>;
            case 'Draft':
                return <Badge variant="secondary">Rascunho</Badge>;
            case 'Archived':
                return <Badge variant="outline" className="text-gray-500">Arquivado</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'Iniciante':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700">Iniciante</Badge>;
            case 'Intermediário':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Intermediário</Badge>;
            case 'Avançado':
                return <Badge variant="outline" className="bg-red-50 text-red-700">Avançado</Badge>;
            default:
                return <Badge variant="outline">{difficulty}</Badge>;
        }
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

    const formatCurrency = (value: number) => {
        if (!value) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Gerenciamento de Cursos</h1>
                <p className="text-muted-foreground">Adicione, edite e organize os cursos da plataforma.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos Publicados</CardTitle>
                        <BookCopy className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{publishedCourses}</div>
                        <p className="text-xs text-muted-foreground">+{draftCourses} rascunhos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground">+12% este mês</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">+8% este mês</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">78%</div>
                        <p className="text-xs text-muted-foreground">+5% este mês</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todos os Cursos</CardTitle>
                        <CardDescription>Visualize e gerencie todos os cursos da plataforma.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/courses/create-with-editor"><PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Curso</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Curso</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Nível</TableHead>
                                <TableHead>Duração</TableHead>
                                <TableHead>Alunos</TableHead>
                                <TableHead>Receita</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <BookCopy className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">Nenhum curso encontrado.</p>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href="/admin/courses/create-with-editor">Criar Primeiro Curso</Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map(course => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {course.coverImageUrl && (
                                                <img 
                                                    src={course.coverImageUrl} 
                                                    alt={course.title}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-sm text-muted-foreground line-clamp-1">
                                                    {course.description}
                                                </div>
                                                {course.isPublicListing && (
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        Listagem Pública
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{course.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getDifficultyBadge(course.difficulty || 'Iniciante')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            {formatDuration(course.estimatedDuration || course.totalDuration)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            {course.students || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                                            {formatCurrency(course.revenue || 0)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(course.status || 'Draft')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/courses/${course.id}/edit`}>
                                                            <BookCopy className="mr-2 h-4 w-4" />
                                                            Editar Conteúdo
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/courses/analytics`}>
                                                            <BarChart2 className="mr-2 h-4 w-4" />
                                                            Ver Analytics
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled={updatingId === course.id} onClick={() => handleStatusToggle(course)}>
                                                        {updatingId === course.id ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : course.status === 'Published' ? (
                                                            <EyeOff className="mr-2 h-4 w-4" />
                                                        ) : (
                                                            <Eye className="mr-2 h-4 w-4" />
                                                        )}
                                                        {course.status === 'Published' ? 'Despublicar' : 'Publicar'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive-foreground" onSelect={(e) => e.preventDefault()}>
                                                          <Trash2 className="mr-2 h-4 w-4"/> Remover
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Essa ação não pode ser desfeita. Isso irá remover permanentemente o curso "{course.title}" e todos os dados associados.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteCourse(course.id, course.title)}>Sim, remover curso</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                         </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
