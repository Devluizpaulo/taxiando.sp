

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getFleetPublicProfile } from '@/app/actions/fleet-actions';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, Sparkles, Star, GalleryVertical } from 'lucide-react';
import { fleetAmenities } from '@/lib/data';
import { VehicleCard } from '@/components/vehicle-card';
import { getReviewsForUser } from '@/app/actions/review-actions';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { use } from 'react';

export default async function FleetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { success, fleet, vehicles } = await getFleetPublicProfile(id);

    if (!success || !fleet) {
        notFound();
    }
    
    const reviews = await getReviewsForUser(id);

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                <section className="relative h-48 w-full bg-accent">
                    <Image src="https://placehold.co/1920x300.png" alt="Capa da Frota" layout="fill" objectFit="cover" className="opacity-20" data-ai-hint="abstract geometric pattern"/>
                </section>
                <div className="container mx-auto -mt-24 px-4 md:px-6">
                    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:text-left">
                        <Avatar className="h-36 w-36 flex-shrink-0 rounded-full border-4 border-background bg-card shadow-lg">
                            <AvatarImage src={fleet.photoUrl || 'https://placehold.co/200x200.png'} alt={`Logo da ${fleet.nomeFantasia || fleet.name}`} />
                            <AvatarFallback className="text-5xl">{(fleet.nomeFantasia || fleet.name)?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h1 className="font-headline text-4xl font-bold">{fleet.nomeFantasia || fleet.name}</h1>
                            <p className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                                <MapPin className="h-4 w-4" /> {fleet.address || 'Endereço não informado'}
                            </p>
                             {fleet.reviewCount && fleet.reviewCount > 0 && (
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                                    <StarRating rating={fleet.averageRating || 0} readOnly size={16}/>
                                    <span>({fleet.averageRating?.toFixed(1)}) de {fleet.reviewCount} avaliações</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Sobre a Frota</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{fleet.companyDescription}</p>
                                </CardContent>
                            </Card>

                             {fleet.galleryImages && fleet.galleryImages.length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><GalleryVertical/> Galeria de Fotos</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {fleet.galleryImages.map((image, index) => (
                                            <div key={index} className="relative aspect-video">
                                                <Image src={image.url} alt={`Foto da galeria ${index + 1}`} fill className="object-cover rounded-md" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}


                            <Card>
                                <CardHeader><CardTitle>Nossos Veículos Disponíveis</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {vehicles && vehicles.length > 0 ? (
                                        vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
                                    ) : (
                                        <p className="col-span-full text-center text-muted-foreground">Nenhum veículo disponível no momento.</p>
                                    )}
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader><CardTitle>Avaliações de Motoristas ({reviews.length})</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    {reviews.length > 0 ? (
                                        reviews.map(review => (
                                            <div key={review.id} className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                                <Avatar>
                                                    <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold">{review.reviewerName}</p>
                                                            <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt as string), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                                                        </div>
                                                        <StarRating rating={review.rating} readOnly />
                                                    </div>
                                                    <p className="mt-2 text-sm text-muted-foreground italic">"{review.comment}"</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-full text-center text-muted-foreground">Esta frota ainda não recebeu avaliações.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                             <Card className="sticky top-24">
                                <CardHeader><CardTitle>Comodidades e Contato</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-3">O que oferecemos:</h3>
                                        <div className="space-y-3">
                                            {fleet.amenities && fleet.amenities.map(amenity => {
                                                const AmenityIcon = fleetAmenities.find(a => a.id === amenity.id)?.icon || Sparkles;
                                                return (
                                                    <div key={amenity.id} className="flex items-center gap-3 text-sm">
                                                        <AmenityIcon className="h-5 w-5 text-primary" />
                                                        <span className="text-muted-foreground">{amenity.label}</span>
                                                    </div>
                                                )
                                            })}
                                            {fleet.otherAmenities && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Sparkles className="h-5 w-5 text-primary" />
                                                    <span className="text-muted-foreground">{fleet.otherAmenities}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold mb-3">Fale Conosco:</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{fleet.phone}</span>
                                            </div>
                                             <div className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{fleet.email}</span>
                                            </div>
                                        </div>
                                    </div>
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
