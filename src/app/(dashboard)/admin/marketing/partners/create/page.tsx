
'use client';

import { PartnerForm } from '../partner-form';

export default function CreatePartnerPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Adicionar Novo Banner</h1>
                <p className="text-muted-foreground">Preencha os detalhes do parceiro/patrocinador para exibi-lo no site.</p>
            </div>
            <PartnerForm />
        </div>
    );
}
