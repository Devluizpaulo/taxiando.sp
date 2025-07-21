

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { type ServiceListing } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';

export function ServiceCard({ service, showProvider = true }: { service: ServiceListing; showProvider?: boolean }) {
    return (
        <Card className="flex flex-col overflow-hidden shadow-md transition-all hover:shadow-xl">
            <Link href={`/services/${service.id}`} className="block">
                <CardHeader className="p-0">
                    <Image 
                        src={service.imageUrls?.[0] || 'https://placehold.co/600x400.png'} 
                        alt={service.title} 
                        width={600} height={400} 
                        className="w-full object-cover aspect-video" 
                        data-ai-hint="mechanic tools workshop"
                    />
                </CardHeader>
                <CardContent className="flex-1 p-4">
                    <Badge variant="secondary" className="mb-2">{service.category}</Badge>
                    <CardTitle className="font-headline text-lg line-clamp-2">{service.title}</CardTitle>
                    {showProvider && (
                        <CardDescription>
                            Oferecido por: {' '}
                            <Link href={`/providers/${service.providerId}`} className="font-medium text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>
                                {service.provider}
                            </Link>
                        </CardDescription>
                    )}
                </CardContent>
            </Link>
             <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
                <p className="text-lg font-bold text-primary">{service.price}</p>
                <Button asChild size="sm">
                    <Link href={`/services/${service.id}`}>
                        <Wrench className="mr-2" /> Ver Detalhes
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
