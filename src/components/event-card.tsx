'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MoveRight, MapPin, Lightbulb, TrafficCone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Event } from '@/lib/types';
import { SharePopover } from './share-buttons';
import { useEffect, useState } from 'react';

export const EventCard = ({ event }: { event: Event }) => {
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const eventUrl = `${window.location.origin}/events#event-${event.id}`;
            setCurrentUrl(eventUrl);
        }
    }, [event.id]);
    
    const eventDate = parseISO(event.startDate as string);
    const day = format(eventDate, "d");
    const month = format(eventDate, "MMM", { locale: ptBR });
    const startTime = format(eventDate, "HH:mm");

    return (
        <Card id={`event-${event.id}`} className="flex h-[450px] w-full max-w-sm flex-row overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-lg transition-shadow duration-300 ease-in-out hover:border-primary hover:shadow-2xl">
            {/* Vertical Stripe */}
            <div className="relative flex w-20 flex-shrink-0 flex-col items-center justify-end bg-background/70 p-2">
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <span className="font-headline text-8xl font-bold text-muted-foreground/10">{day}</span>
                </div>
                <div className="relative z-10 flex h-full flex-col items-center justify-between">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="mt-2 rounded-md" />
                    <div className="flex h-full items-center justify-center">
                         <h3 className="font-headline text-2xl font-bold uppercase text-muted-foreground [writing-mode:vertical-rl]">{month.replace('.', '')}</h3>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex flex-1 flex-col justify-between p-4">
                 <div className="space-y-3">
                    <CardHeader className="p-0">
                        <CardTitle className="font-headline text-xl leading-tight line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-1 text-sm">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="line-clamp-1">{event.location}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <p className="text-xs text-muted-foreground line-clamp-3">
                           {event.description}
                        </p>
                        <div className="mt-3 space-y-2 border-t pt-3 text-xs">
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <Lightbulb className="h-4 w-4 flex-shrink-0 text-primary" />
                                <p><span className="font-semibold text-foreground">Dica de Pico:</span> {event.peakTimes}</p>
                            </div>
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <TrafficCone className="h-4 w-4 flex-shrink-0 text-primary" />
                                <p><span className="font-semibold text-foreground">Dica de Trânsito:</span> {event.trafficTips}</p>
                            </div>
                        </div>
                    </CardContent>
                 </div>

                <CardFooter className="flex items-center justify-between p-0 pt-4">
                    <p className="font-bold text-lg text-accent">{startTime}</p>
                    <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                            <a href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                                Mapa
                            </a>
                        </Button>
                        {currentUrl && <SharePopover title={event.title} url={currentUrl} />}
                    </div>
                </CardFooter>
            </div>
        </Card>
    );
}
