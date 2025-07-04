
'use client';

import { useEffect, useState, useMemo } from 'react';
import { type Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoveRight, Loader2, Calendar } from 'lucide-react';
import { parseISO, isToday, isTomorrow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUpcomingEvents } from '@/app/actions/event-actions';
import { EventCard } from './event-card';

const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd/MM", { locale: ptBR });
};

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
                    {sortedDates.slice(0, 2).map(date => ( // Show max 2 days on homepage
                        <div key={date}>
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Calendar className="text-primary"/> 
                                <span className="capitalize">{getDateLabel(date)}</span>
                            </h3>
                            <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 snap-x snap-mandatory">
                                {groupedEvents[date].map((event) => (
                                    <div key={event.id} className="w-full max-w-md sm:w-[24rem] flex-shrink-0 snap-start">
                                      <EventCard event={event} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-12 text-center">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/events">
                            Ver Agenda Completa <MoveRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
