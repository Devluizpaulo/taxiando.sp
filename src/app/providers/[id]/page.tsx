
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProviderPublicProfile } from '@/app/actions/service-actions';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, Instagram, MessageSquare, Building } from 'lucide-react';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { ServiceCard } from '@/components/service-card';
import { Button } from '@/components/ui/button';

export default async function ProviderProfilePage({ params }: { params: { id: string } }) {
    const { success, provider, services } = await getProviderPublicProfile(params.id);

    if (!success || !provider) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                <section className="relative h-48 w-full bg-accent">
                    <Image src="https://placehold.co/1920x300.png" alt="Capa do Prestador" layout="fill" objectFit="cover" className="opacity-20" data-ai-hint="abstract geometric pattern"/>
                </section>
                <div className="container mx-auto -mt-24 px-4 md:px-6">
                    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:text-left">
                        <div className="relative h-36 w-36 flex-shrink-0 rounded-full border-4 border-background bg-card shadow-lg flex items-center justify-center">
                             <Building className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="font-headline text-4xl font-bold">{provider.nomeFantasia || provider.name}</h1>
                            <p className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                                <MapPin className="h-4 w-4" /> {provider.address || 'Endereço não informado'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Sobre a Empresa</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{provider.companyDescription}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Nossos Serviços Oferecidos</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {services && services.length > 0 ? (
                                        services.map(service => <ServiceCard key={service.id} service={service} showProvider={false} />)
                                    ) : (
                                        <p className="col-span-full text-center text-muted-foreground">Nenhum serviço ativo no momento.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                             <Card className="sticky top-24">
                                <CardHeader><CardTitle>Informações de Contato</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{provider.phone}</span>
                                        </div>
                                         <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{provider.email}</span>
                                        </div>
                                    </div>
                                    
                                    {provider.socialMedia && (provider.socialMedia.instagram || provider.socialMedia.facebook || provider.socialMedia.whatsapp) && (
                                        <div className="border-t pt-6">
                                            <h3 className="font-semibold mb-3">Redes Sociais</h3>
                                            <div className="flex gap-2">
                                                {provider.socialMedia.instagram && <Button asChild variant="outline" size="icon"><a href={`https://instagram.com/${provider.socialMedia.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"><Instagram /></a></Button>}
                                                {provider.socialMedia.facebook && <Button asChild variant="outline" size="icon"><a href={`https://facebook.com${provider.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer"><FacebookIcon /></a></Button>}
                                                {provider.socialMedia.whatsapp && <Button asChild variant="outline" size="icon"><a href={`https://wa.me/${provider.socialMedia.whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageSquare /></a></Button>}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                             </Card>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
