
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { MoveRight, Loader2, Calendar, MapPin } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, startOfTomorrow, addDays, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUpcomingEvents } from '@/app/actions/event-actions';

const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd/MM", { locale: ptBR });
};


const EventCard = ({ event }: { event: Event }) => {
    const startTime = format(new Date(event.startDate as string), "HH:mm");
    return (
        <div className="w-80 flex-shrink-0 snap-start">
            <Card className="flex flex-col h-full overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary">
                <CardHeader className="p-4 bg-accent text-accent-foreground flex flex-row items-center justify-between">
                    <Image src="/logo.png" alt="Táxiando SP Logo" width={40} height={40} className="rounded-md" />
                    <div className="text-right">
                        <p className="text-sm font-semibold">Início às</p>
                        <p className="text-2xl font-bold">{startTime}</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-2">
                    <CardTitle className="font-headline text-lg line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="text-sm mt-1 line-clamp-2 flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                        <span>{event.location}</span>
                    </CardDescription>
                </CardContent>
                <CardFooter className="p-4 bg-muted/50">
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                        Ver no Mapa <MoveRight className="ml-2" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}


export function CulturalAgendaSection() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUpcomingEvents().then(data => {
            setEvents(data);
            setLoading(false);
        });
    }, []);

    const groupedEvents = useMemo(() => {
        const groups: Record<string, Event[]> = {};
        events.forEach(event => {
            const dateKey = (event.startDate as string).split('T')[0];
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(event);
        });
        return groups;
    }, [events]);

    const sortedDates = useMemo(() => Object.keys(groupedEvents).sort(), [groupedEvents]);

    if (loading) {
        return (
            <section id="agenda" className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    if (!events || events.length === 0) {
        return null; // Don't render the section if there are no events
    }

    return (
        <section id="agenda" className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                        Agenda Cultural de SP
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        Fique por dentro dos principais eventos da cidade e planeje suas corridas.
                    </p>
                </div>
                <div className="space-y-10">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Calendar className="text-primary"/> 
                                <span className="capitalize">{getDateLabel(date)}</span>
                            </h3>
                            <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 snap-x snap-mandatory">
                                {groupedEvents[date].map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
