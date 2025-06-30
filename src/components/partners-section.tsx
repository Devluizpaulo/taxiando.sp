
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Partner } from '@/lib/types';
import { getActivePartners } from '@/app/actions/marketing-actions';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export function PartnersSection() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActivePartners().then(data => {
            setPartners(data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load partners, section will be hidden.", err);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <section id="partners" className="py-16 md:py-24 bg-muted">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-12 text-center">
                        <Skeleton className="h-10 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-10">
                        <Skeleton className="w-40 h-20" />
                        <Skeleton className="w-60 h-32" />
                        <Skeleton className="w-40 h-20" />
                    </div>
                </div>
            </section>
        );
    }

    if (partners.length === 0) {
        return null;
    }

    return (
        <section id="partners" className="py-16 md:py-24 bg-muted">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">Nossos Parceiros e Patrocinadores</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Empresas que confiam e apoiam a nossa comunidade.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-10">
                    {partners.map((partner) => (
                        <Link key={partner.id} href={partner.linkUrl} target="_blank" rel="noopener noreferrer" title={partner.name} className={cn(
                            "relative transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg",
                            {
                                'w-40 h-20': partner.size === 'small',
                                'w-60 h-32': partner.size === 'medium',
                                'w-80 h-40': partner.size === 'large',
                            }
                        )}>
                            <Image
                                src={partner.imageUrl}
                                alt={partner.name}
                                fill
                                className="object-contain"
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
