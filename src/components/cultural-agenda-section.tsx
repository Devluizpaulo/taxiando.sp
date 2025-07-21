

'use client';

import { useEffect, useState, useMemo } from 'react';
import { type Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoveRight, Loader2, Calendar } from 'lucide-react';
import { parseISO, isToday, isTomorrow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUpcomingEvents } from '@/app/actions/event-actions';
import { EventCard, PosterEventCard } from './event-card';

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
        <section id="agenda" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-zinc-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="font-headline text-3xl sm:text-4xl font-bold tracking-tighter bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-md">
                        Agenda Cultural de SP
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500 leading-relaxed">
                        Fique por dentro dos principais eventos da cidade e planeje suas corridas.
                    </p>
                </div>
                <div className="space-y-12">
                    {sortedDates.slice(0, 2).map(date => (
                        <div key={date} className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span className="capitalize">{getDateLabel(date)}</span>
                                </span>
                                <div className="flex-1 h-px bg-gradient-to-r from-amber-200 via-slate-200 to-transparent ml-2"></div>
                            </div>
                            <div className="flex justify-center items-stretch overflow-x-auto gap-8 pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {groupedEvents[date].map((event, idx) => (
                                    <div key={event.id} className="w-full max-w-xs sm:w-64 flex-shrink-0 snap-start animate-slide-in" style={{ animationDelay: `${idx * 80}ms` }}>
                                        <PosterEventCard event={event} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all">
                        <Link href="/events">
                            Ver Agenda Completa <MoveRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
