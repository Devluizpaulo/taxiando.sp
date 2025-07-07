
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function FleetReportsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Relatórios da Frota</h1>
                <p className="text-muted-foreground">Analise o desempenho dos seus veículos e candidaturas.</p>
            </div>
            <Card className="flex flex-col items-center justify-center p-12 text-center">
                <CardHeader>
                    <Construction className="h-16 w-16 mx-auto text-primary" />
                    <CardTitle className="mt-4">Página em Construção</CardTitle>
                    <CardDescription>
                        Estamos trabalhando para trazer relatórios detalhados para você gerenciar sua frota com ainda mais eficiência.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
