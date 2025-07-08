
'use client';

import { useState, useMemo } from 'react';
import { type Course } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function CoursesAnalyticsClientPage({ initialCourses }: { initialCourses: Course[] }) {
    const [courses, setCourses] = useState<Course[]>(initialCourses);

    const analytics = useMemo(() => {
        return courses.reduce((acc, course) => {
            const revenue = course.revenue || 0;
            const cost = course.investmentCost || 0;
            acc.totalInvestment += cost;
            acc.totalRevenue += revenue;
            acc.totalStudents += course.students || 0;
            return acc;
        }, { totalInvestment: 0, totalRevenue: 0, totalStudents: 0 });
    }, [courses]);

    const totalProfit = analytics.totalRevenue - analytics.totalInvestment;

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Análise de Cursos</h1>
                <p className="text-muted-foreground">Monitore o desempenho financeiro e de engajamento dos seus cursos.</p>
            </div>
            
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Receita de Créditos</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Investimento Total</CardTitle><TrendingDown className="h-4 w-4 text-red-500" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{formatCurrency(analytics.totalInvestment)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className={cn("text-2xl font-bold", totalProfit >= 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(totalProfit)}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Alunos</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{analytics.totalStudents}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Desempenho por Curso</CardTitle>
                    <CardDescription>Análise detalhada de cada curso da plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Curso</TableHead>
                                <TableHead className="text-right">Custo</TableHead>
                                <TableHead className="text-right">Receita</TableHead>
                                <TableHead className="text-right">Alunos</TableHead>
                                <TableHead className="text-right">Lucro/Prejuízo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum curso cadastrado.</TableCell></TableRow>
                            ) : (
                                courses.map(course => {
                                    const revenue = course.revenue || 0;
                                    const cost = course.investmentCost || 0;
                                    const profit = revenue - cost;
                                    return (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(cost)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(revenue)}</TableCell>
                                            <TableCell className="text-right">{course.students || 0}</TableCell>
                                            <TableCell className={cn("text-right font-semibold", profit >= 0 ? 'text-green-600' : 'text-red-600')}>
                                                {formatCurrency(profit)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
