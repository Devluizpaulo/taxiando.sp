'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MoveRight, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { type Event } from '@/lib/types';
import { SharePopover } from './share-buttons';
import { useEffect, useState } from 'react';

export const EventCard = ({ event }: { event: Event }) => {
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        // This ensures window is available and constructs the shareable URL
        if (typeof window !== 'undefined') {
            const eventUrl = `${window.location.origin}/events#event-${event.id}`;
            setCurrentUrl(eventUrl);
        }
    }, [event.id]);

    const startTime = format(new Date(event.startDate as string), "HH:mm");

    return (
        <Card id={`event-${event.id}`} className="flex h-full flex-col overflow-hidden border-2 border-transparent bg-card shadow-lg transition-shadow hover:border-primary hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between bg-accent p-4 text-accent-foreground">
                <Image src="/logo.png" alt="Táxiando SP Logo" width={40} height={40} className="rounded-md" />
                <div className="text-right">
                    <p className="text-sm font-semibold">Início às</p>
                    <p className="text-2xl font-bold">{startTime}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 p-4">
                <CardTitle className="font-headline text-lg line-clamp-2">{event.title}</CardTitle>
                <CardDescription className="mt-1 flex items-start gap-2 pt-1 text-sm line-clamp-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span>{event.location}</span>
                </CardDescription>
            </CardContent>
            <CardFooter className="flex items-center justify-between bg-muted/50 p-4">
                <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                    Ver no Mapa <MoveRight className="ml-2" />
                    </a>
                </Button>
                {currentUrl && <div className="ml-2"><SharePopover title={event.title} url={currentUrl} /></div>}
            </CardFooter>
        </Card>
    );
}
