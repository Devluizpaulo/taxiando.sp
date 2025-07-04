
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUpcomingEvents } from '@/app/actions/event-actions';
import { type Event } from '@/lib/types';
import { EventCard } from "@/components/event-card";

const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd/MM", { locale: ptBR });
};

export default async function EventsPage() {
    const events = await getUpcomingEvents();

    const groupedEvents = events.reduce((acc, event) => {
        const dateKey = (event.startDate as string).split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    const sortedDates = Object.keys(groupedEvents).sort();

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <div className="mb-12 text-center">
                        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Agenda Cultural de SP</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                            Os principais eventos da semana para você se programar e maximizar suas corridas.
                        </p>
                    </div>

                    {events.length > 0 ? (
                        <div className="space-y-12">
                            {sortedDates.map(date => (
                                <div key={date}>
                                    <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                                        <Calendar className="text-primary"/> 
                                        <span className="capitalize">{getDateLabel(date)}</span>
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {groupedEvents[date].map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="py-16 text-center">
                            <CardHeader>
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <CardTitle>Nenhum evento programado</CardTitle>
                                <CardDescription>A agenda da semana ainda está sendo preparada. Volte em breve!</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
