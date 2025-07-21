
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPartnerById } from '@/app/actions/marketing-actions';
import { PartnerForm } from '../../partner-form';
import { LoadingScreen } from '@/components/loading-screen';
import { type Partner } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function EditPartnerPage({ params }: { params: { id: string } }) {
    const [partner, setPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        getPartnerById(params.id).then(data => {
            if (data) {
                setPartner(data);
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Parceiro não encontrado.' });
                router.push('/admin/marketing/partners');
            }
            setLoading(false);
        });
    }, [params.id, router, toast]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!partner) {
        return null;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Banner</h1>
                <p className="text-muted-foreground">Ajuste os detalhes do parceiro/patrocinador.</p>
            </div>
            <PartnerForm partner={partner} />
        </div>
    );
}
