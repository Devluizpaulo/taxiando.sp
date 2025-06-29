'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthProtection } from '@/hooks/use-auth';
import { mockApplications } from "@/lib/mock-data";

const getStatusVariant = (status: string) => {
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
    useAuthProtection();

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
                            {mockApplications.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.vehicleName}</TableCell>
                                    <TableCell>{app.company}</TableCell>
                                    <TableCell>{new Date(app.appliedAt).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">Ver Veículo</Button>
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
