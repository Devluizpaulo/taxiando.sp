
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
import { MoreHorizontal, PlusCircle, BookCopy, BarChart2, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CoursesClientPage({ initialCourses }: { initialCourses: Course[] }) {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const { toast } = useToast();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const totalStudents = courses.reduce((acc, c) => acc + (c.students || 0), 0);

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
                        <BookCopy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{courses.filter(c => c.status === 'Published').length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{totalStudents}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Todos os Cursos</CardTitle>
                        <CardDescription>Visualize e gerencie todos os cursos.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/admin/courses/create"><PlusCircle /> Criar Novo Curso</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título do Curso</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Módulos / Aulas</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Nenhum curso encontrado. Que tal criar o primeiro?
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map(course => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{course.category}</Badge>
                                    </TableCell>
                                    <TableCell>{course.modules.length} / {course.totalLessons}</TableCell>
                                    <TableCell>
                                        <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>
                                            {course.status === 'Published' ? 'Publicado' : 'Rascunho'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild><Link href={`/admin/courses/${course.id}/edit`}>Editar Conteúdo</Link></DropdownMenuItem>
                                                    <DropdownMenuItem disabled={updatingId === course.id} onClick={() => handleStatusToggle(course)}>
                                                        {updatingId === course.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (course.status === 'Published' ? 'Despublicar' : 'Publicar')}
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
