
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { getServiceById } from '@/app/actions/service-actions';
import { ServiceForm } from '../../service-form';
import { LoadingScreen } from '@/components/loading-screen';
import { type ServiceListing } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function EditServicePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [service, setService] = useState<ServiceListing | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!id) {
            router.push('/services');
            return;
        }
        const fetchService = async () => {
            const fetchedService = await getServiceById(id);
            if (fetchedService) {
                setService(fetchedService);
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Anúncio não encontrado.' });
                router.push('/services');
            }
            setLoading(false);
        };
        fetchService();
    }, [id, router, toast]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!service) {
        // This case is mostly handled by the redirect, but as a fallback.
        return (
             <div className="flex flex-col gap-8 items-center justify-center h-full">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Anúncio não encontrado</h1>
                <p className="text-muted-foreground">O anúncio que você está tentando editar não existe ou foi removido.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Anúncio</h1>
                <p className="text-muted-foreground">Ajuste os detalhes do seu serviço. Suas alterações serão enviadas para uma nova revisão.</p>
            </div>
            <ServiceForm service={service} />
        </div>
    );
}
