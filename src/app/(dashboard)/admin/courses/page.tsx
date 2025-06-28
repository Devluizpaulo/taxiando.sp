'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, BookCopy, BarChart2 } from 'lucide-react';
import Link from 'next/link';

const courses = [
  { id: 'crs_1', title: 'Legislação de Trânsito para Taxistas', category: 'Legislação', modules: 5, lessons: 22, students: 152, status: 'Published' },
  { id: 'crs_2', title: 'Inglês para Atendimento ao Turista', category: 'Atendimento', modules: 4, lessons: 18, students: 98, status: 'Published' },
  { id: 'crs_3', title: 'Direção Defensiva e Primeiros Socorros', category: 'Segurança', modules: 7, lessons: 35, students: 210, status: 'Published' },
  { id: 'crs_4', title: 'Gestão Financeira para Autônomos', category: 'Finanças', modules: 3, lessons: 12, students: 0, status: 'Draft' },
];

export default function AdminCoursesPage() {
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
                    <CardContent><div className="text-2xl font-bold">{courses.reduce((acc, c) => acc + c.students, 0)}</div></CardContent>
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
                            {courses.map(course => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{course.category}</Badge>
                                    </TableCell>
                                    <TableCell>{course.modules} / {course.lessons}</TableCell>
                                    <TableCell>
                                        <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>
                                            {course.status === 'Published' ? 'Publicado' : 'Rascunho'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem>Editar Conteúdo</DropdownMenuItem>
                                                <DropdownMenuItem>Ver Alunos</DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    {course.status === 'Published' ? 'Despublicar' : 'Publicar'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive-foreground">Remover</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}