'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthProtection } from '@/hooks/use-auth';

const applications = [
    { id: 'app_1', title: 'Motorista Turno da Noite', company: 'Frota Rápida SP', status: 'Em Análise', appliedDate: '20/07/2024' },
    { id: 'app_2', title: 'Vaga para Aeroporto GUA', company: 'Cooperativa Alfa', status: 'Visualizado', appliedDate: '18/07/2024' },
    { id: 'app_3', title: 'Motorista Fim de Semana', company: 'Táxi Legal', status: 'Rejeitado', appliedDate: '15/07/2024' },
    { id: 'app_4', title: 'Motorista Bilíngue (Eventos)', company: 'SP TuriTaxi', status: 'Contato Realizado', appliedDate: '12/07/2024' },
];

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Contato Realizado':
            return 'default';
        case 'Em Análise':
        case 'Visualizado':
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
                <p className="text-muted-foreground">Acompanhe o status das suas aplicações para as oportunidades.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Candidaturas</CardTitle>
                    <CardDescription>Aqui você pode ver todas as vagas para as quais se candidatou e o andamento do processo seletivo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Oportunidade</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Data da Aplicação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map(app => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.title}</TableCell>
                                    <TableCell>{app.company}</TableCell>
                                    <TableCell>{app.appliedDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">Ver Vaga</Button>
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
