
'use client';

import { ServiceForm } from '../service-form';

export default function CreateServicePage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Criar Novo Anúncio</h1>
                <p className="text-muted-foreground">Descreva o serviço ou produto que você oferece para a comunidade.</p>
            </div>
            <ServiceForm />
        </div>
    );
}
