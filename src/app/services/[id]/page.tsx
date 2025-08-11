

'use client'

import { useState, useEffect } from 'react';
import { getServiceAndProviderDetails } from "@/app/actions/service-actions";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, MessageSquare, Phone, MapPin, Building } from "lucide-react";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from 'next/navigation';
import { notFound } from "next/navigation";
import { LoadingScreen } from '@/components/loading-screen';
import { type ServiceListing, type UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { trackContentView } from '@/app/actions/analytics-actions';

export default function ServicePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const { toast } = useToast();

    const [service, setService] = useState<ServiceListing | null>(null);
    const [provider, setProvider] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            router.push('/services/marketplace');
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            const result = await getServiceAndProviderDetails(id);
            if (result.success && result.service) {
                setService(result.service);
                setProvider(result.provider);
                if (result.service.imageUrls && result.service.imageUrls.length > 0) {
                    setMainImage(result.service.imageUrls[0]);
                }
                
                // Track content view
                trackContentView('service', result.service.id, result.service.title);
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: result.error || 'Serviço não encontrado.' });
                notFound();
            }
            setLoading(false);
        };

        fetchDetails();
    }, [id, router, toast]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!service) {
        return null; // or a not found component
    }

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1 py-12 md:py-16">
                 <div className="container mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <Link href="/services/marketplace" className="text-sm text-primary hover:underline mb-2 inline-block">
                                &larr; Voltar para o marketplace
                            </Link>
                            <Badge variant="secondary" className="mb-2">{service.category}</Badge>
                            <h1 className="font-headline text-4xl font-bold tracking-tight">{service.title}</h1>
                        </div>
                        
                        <div className="space-y-4">
                            <Image src={mainImage || 'https://placehold.co/800x600.png'} alt={service.title} width={800} height={600} className="w-full rounded-xl object-cover aspect-video" data-ai-hint="tools workshop services"/>
                            {service.imageUrls && service.imageUrls.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {service.imageUrls.map((url, index) => (
                                        <button key={index} onClick={() => setMainImage(url)} className={cn("relative aspect-video rounded-md overflow-hidden transition-opacity hover:opacity-80 focus:ring-2 focus:ring-ring ring-offset-2", mainImage === url && "ring-2 ring-ring")}>
                                            <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Card>
                            <CardHeader><CardTitle>Descrição do Serviço</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p></CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                             <Card>
                                <CardHeader>
                                    <p className="text-sm text-muted-foreground">Preço / Condição</p>
                                    <p className="text-4xl font-bold font-headline text-primary">
                                        {service.price}
                                    </p>
                                </CardHeader>
                                {provider && provider.phone && (
                                    <CardContent>
                                        <Button size="lg" className="w-full" asChild>
                                            <a href={`tel:${provider.phone}`}>
                                                <Phone className="mr-2"/> Ligar para Contratar
                                            </a>
                                        </Button>
                                    </CardContent>
                                )}
                            </Card>
                            {provider && (
                                <Card>
                                    <CardHeader>
                                        <p className="text-sm text-muted-foreground">Oferecido por</p>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            <Link href={`/providers/${provider.uid}`} className="hover:underline">
                                                {provider.nomeFantasia || provider.name}
                                            </Link>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                                            {provider.address && (
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <span>{provider.address}</span>
                                                </div>
                                            )}
                                            {provider.phone && (
                                                <div className="flex items-start gap-3">
                                                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <span>{provider.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {provider.socialMedia && (provider.socialMedia.instagram || provider.socialMedia.facebook) && (
                                            <div className="border-t pt-4">
                                                <h4 className="font-semibold mb-2 text-card-foreground">Redes Sociais e Contato</h4>
                                                <div className="flex gap-2">
                                                    {provider.socialMedia.instagram && <Button asChild variant="outline" size="icon"><a href={`https://instagram.com/${provider.socialMedia.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" title="Instagram"><Instagram /></a></Button>}
                                                    {provider.socialMedia.facebook && <Button asChild variant="outline" size="icon"><a href={`https://facebook.com${provider.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" title="Facebook"><FacebookIcon /></a></Button>}

                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    )
}
