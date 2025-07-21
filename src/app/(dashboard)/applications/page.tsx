
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getDriverApplications } from '@/app/actions/fleet-actions';
import { type VehicleApplication } from '@/lib/types';
import { LoadingScreen } from '@/components/loading-screen';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toDate } from '@/lib/date-utils';

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Aprovado':
            return 'default';
        case 'Pendente':
            return 'secondary';
        case 'Rejeitado':
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function ApplicationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [applications, setApplications] = useState<VehicleApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchApps = async () => {
                setLoading(true);
                const userApps = await getDriverApplications(user.uid);
                setApplications(userApps);
                setLoading(false);
            };
            fetchApps();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Minhas Candidaturas</h1>
                <p className="text-muted-foreground">Acompanhe o status das suas solicitações de aluguel de veículos.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Solicitações</CardTitle>
                    <CardDescription>Aqui você pode ver todos os veículos para os quais enviou uma solicitação e o andamento do processo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Veículo</TableHead>
                                <TableHead>Frota / Locador</TableHead>
                                <TableHead>Data da Solicitação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Você ainda não se candidatou a nenhum veículo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.vehicleName}</TableCell>
                                        <TableCell>{app.company}</TableCell>
                                        <TableCell>{toDate(app.appliedAt)?.toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/rentals/${app.vehicleId}`}>Ver Veículo</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
