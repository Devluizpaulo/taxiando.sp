
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { MoveRight, Calendar, MapPin } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUpcomingEvents } from '@/app/actions/event-actions';
import { type Event } from '@/lib/types';

const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd/MM", { locale: ptBR });
};

const EventCard = ({ event }: { event: Event }) => {
    const startTime = format(new Date(event.startDate as string), "HH:mm");
    return (
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
    );
}

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
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Agenda Cultural de SP</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                            Os principais eventos da semana para você se programar e maximizar suas corridas.
                        </p>
                    </div>

                    {events.length > 0 ? (
                        <div className="space-y-12">
                            {sortedDates.map(date => (
                                <div key={date}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <Calendar className="text-primary"/> 
                                        <span className="capitalize">{getDateLabel(date)}</span>
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {groupedEvents[date].map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-16">
                            <CardHeader>
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
