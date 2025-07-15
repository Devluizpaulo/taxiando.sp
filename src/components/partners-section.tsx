
import Link from 'next/link';
import Image from 'next/image';
import { type Partner } from '@/lib/types';
import { getActivePartners } from '@/app/actions/marketing-actions';
import { cn } from '@/lib/utils';

export async function PartnersSection() {
    const partners = await getActivePartners();

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
                                src={partner.imageUrls?.[0] || 'https://placehold.co/600x400.png'}
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
