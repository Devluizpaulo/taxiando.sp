
'use client';

import { type getAdminReportsData } from '@/app/actions/admin-actions';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Car, FileText, BarChart2, Star, Download } from 'lucide-react';

type ReportsData = Awaited<ReturnType<typeof getAdminReportsData>>;

export function ReportsClientPage({ initialReports }: { initialReports: ReportsData }) {

    if (!initialReports.success) {
        return <div>Erro ao carregar relatórios.</div>;
    }

    const { userReports, financialReports, engagementReports } = initialReports;
    
    const userRoleData = Object.entries(userReports?.userCounts ?? {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        total: value
    }));

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Relatórios da Plataforma</h1>
                <p className="text-muted-foreground">Analise dados e extraia insights para guiar o crescimento do negócio.</p>
            </div>

             <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                    <TabsTrigger value="users"><Users className="mr-2"/>Usuários</TabsTrigger>
                    <TabsTrigger value="financial"><BarChart2 className="mr-2"/>Financeiro</TabsTrigger>
                    <TabsTrigger value="engagement"><Car className="mr-2"/>Engajamento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição de Usuários por Perfil</CardTitle>
                            <CardDescription>Total de {userReports?.totalUsers ?? 0} usuários cadastrados.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userRoleData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" name="Total"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Top 5 Motoristas por Avaliação</CardTitle>
                                <CardDescription>Motoristas com as melhores médias de avaliação.</CardDescription>
                            </div>
                             <Button variant="outline" size="sm" disabled><Download className="mr-2"/>Exportar</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Avaliação Média</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {userReports?.topRatedDrivers?.map((driver: any) => (
                                        <TableRow key={driver.uid}>
                                            <TableCell className="font-medium">{driver.name}</TableCell>
                                            <TableCell>{driver.email}</TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                <Star className="h-4 w-4 text-yellow-500"/>
                                                {(driver.averageRating || 0).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="financial" className="mt-6 space-y-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Desempenho dos Pacotes de Crédito</CardTitle>
                                <CardDescription>Performance de vendas de cada pacote.</CardDescription>
                            </div>
                             <Button variant="outline" size="sm" disabled><Download className="mr-2"/>Exportar</Button>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader><TableRow><TableHead>Pacote</TableHead><TableHead>Créditos</TableHead><TableHead className="text-right">Preço</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {financialReports?.packages?.map((pkg: any) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-medium">{pkg.name}</TableCell>
                                            <TableCell>{pkg.credits}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(pkg.price)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Top 5 Cupons Utilizados</CardTitle>
                                <CardDescription>Os cupons de desconto mais populares na plataforma.</CardDescription>
                            </div>
                             <Button variant="outline" size="sm" disabled><Download className="mr-2"/>Exportar</Button>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Usos</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {financialReports?.topUsedCoupons?.map((coupon: any) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell><Badge>{coupon.code}</Badge></TableCell>
                                            <TableCell className="capitalize">{coupon.discountType === 'fixed' ? 'Fixo' : 'Porcentagem'}</TableCell>
                                            <TableCell className="text-right">{coupon.uses}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="engagement" className="mt-6 space-y-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Estatísticas do Marketplace</CardTitle>
                                <CardDescription>Visão geral do ecossistema de locação.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" disabled><Download className="mr-2"/>Exportar</Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Veículos Anunciados</p>
                                <p className="text-3xl font-bold">{engagementReports?.totalVehicles ?? 0}</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Veículos Alugados</p>
                                <p className="text-3xl font-bold">{engagementReports?.rentedVehicles ?? 0}</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Total de Candidaturas</p>
                                <p className="text-3xl font-bold">{engagementReports?.totalApplications ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Top 5 Cursos por Nº de Alunos</CardTitle>
                                <CardDescription>Os cursos com maior engajamento na plataforma.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" disabled><Download className="mr-2"/>Exportar</Button>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader><TableRow><TableHead>Curso</TableHead><TableHead className="text-right">Alunos Inscritos</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {engagementReports?.topCourses?.map((course: any) => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell className="text-right">{course.students || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
