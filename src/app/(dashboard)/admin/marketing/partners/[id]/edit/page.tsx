
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPartnerById } from '@/app/actions/marketing-actions';
import { PartnerForm } from '../../partner-form';
import { LoadingScreen } from '@/components/loading-screen';
import { type Partner } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { partnerFormSchema, type PartnerFormValues } from '@/lib/marketing-schemas';

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
    });

    useEffect(() => {
        setIsLoading(true);
        getPartnerById(id).then(data => {
            if (data) {
                form.reset(data);
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Parceiro não encontrado.' });
                router.push('/admin/marketing/partners');
            }
            setIsLoading(false);
        });
    }, [id, router, toast]);

    if (isLoading) {

        return <LoadingScreen />;
    }

    if (!form.formState.isValidating && !form.formState.isValid) {
        return (
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Banner</h1>
                    <p className="text-muted-foreground">Ajuste os detalhes do parceiro/patrocinador.</p>
                </div>
                <PartnerForm partner={undefined} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Banner</h1>
                <p className="text-muted-foreground">Ajuste os detalhes do parceiro/patrocinador.</p>
            </div>
            <PartnerForm partner={undefined} />
        </div>
    );
}
