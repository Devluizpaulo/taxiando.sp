
'use client';

import { type getFleetReportData } from '@/app/actions/fleet-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Car, Users, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type FleetReportData = Awaited<ReturnType<typeof getFleetReportData>>;

export function FleetReportsClientPage({ initialReportData }: { initialReportData: FleetReportData }) {
    if (!initialReportData.success) {
        return (
            <div className="flex flex-col gap-8">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Relatórios da Frota</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Erro ao carregar dados</CardTitle>
                        <CardDescription>{initialReportData.error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const {
        totalVehicles,
        totalApplications,
        approvalRate,
        applicationStatusData,
        vehiclePerformance
    } = initialReportData;

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Relatórios da Frota</h1>
                <p className="text-muted-foreground">Analise o desempenho dos seus veículos e candidaturas.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVehicles}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Candidaturas Recebidas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApplications}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvalRate ? approvalRate.toFixed(1) : '0.0'}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Desempenho por Veículo</CardTitle>
                        <CardDescription>Veja quais dos seus veículos atraem mais interesse.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Veículo</TableHead>
                                    <TableHead className="text-center">Aprovadas</TableHead>
                                    <TableHead className="text-center">Pendentes</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehiclePerformance && vehiclePerformance.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Nenhum dado de performance ainda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vehiclePerformance && vehiclePerformance.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell className="font-medium">{v.name}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">{v.approvedApplications}</Badge>
                                            </TableCell>
                                             <TableCell className="text-center">
                                                <Badge variant="secondary">{v.pendingApplications}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">{v.totalApplications}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Funil de Candidaturas</CardTitle>
                        <CardDescription>O status atual de todas as candidaturas recebidas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={applicationStatusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                                <Tooltip wrapperClassName="!bg-background !border-border" cursor={{ fill: 'hsl(var(--muted))' }}/>
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
