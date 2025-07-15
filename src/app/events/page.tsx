
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, MapPin, Compass } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUpcomingEvents } from '@/app/actions/event-actions';
import { getTips } from '@/app/actions/city-guide-actions';
import { type Event, type CityTip } from '@/lib/types';
import { EventCard } from "@/components/event-card";
import { CityTipCard } from "@/components/city-tip-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default async function EventsPage() {
    const [events, tips] = await Promise.all([
        getUpcomingEvents(),
        getTips()
    ]);
    
    const driverTips = tips.filter(t => t.target === 'driver');
    const clientTips = tips.filter(t => t.target === 'client');

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
                        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Guia SP</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                            Explore os principais eventos, dicas de gastronomia e lazer para aproveitar São Paulo ao máximo.
                        </p>
                    </div>

                     <Tabs defaultValue="events" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="events">Eventos da Semana</TabsTrigger>
                            <TabsTrigger value="driver_tips">Para Você, Motorista</TabsTrigger>
                            <TabsTrigger value="client_tips">Para seu Cliente</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="events" className="mt-8">
                             {events.length > 0 ? (
                                <div className="space-y-12">
                                    {sortedDates.map(date => (
                                        <div key={date}>
                                            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                                                <Calendar className="text-primary"/> 
                                                <span className="capitalize">{format(parseISO(date), "EEEE, dd/MM", { locale: ptBR })}</span>
                                            </h2>
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                                {groupedEvents[date].map((event) => (
                                                    <EventCard key={event.id} event={event} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Card className="py-16 text-center mt-8">
                                    <CardHeader>
                                        <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <CardTitle>Nenhum evento programado</CardTitle>
                                        <CardDescription>A agenda da semana ainda está sendo preparada. Volte em breve!</CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="driver_tips" className="mt-8">
                             {driverTips.length > 0 ? (
                                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {driverTips.map(tip => <CityTipCard key={tip.id} tip={tip} />)}
                                 </div>
                             ) : (
                                 <Card className="py-16 text-center">
                                    <CardHeader>
                                        <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <CardTitle>Nenhuma Dica Cadastrada</CardTitle>
                                        <CardDescription>Estamos preparando as melhores dicas para você. Volte em breve!</CardDescription>
                                    </CardHeader>
                                </Card>
                             )}
                        </TabsContent>

                         <TabsContent value="client_tips" className="mt-8">
                             {clientTips.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {clientTips.map(tip => <CityTipCard key={tip.id} tip={tip} />)}
                                 </div>
                             ) : (
                                  <Card className="py-16 text-center">
                                    <CardHeader>
                                        <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <CardTitle>Nenhuma Dica Cadastrada</CardTitle>
                                        <CardDescription>Estamos preparando as melhores sugestões para seus clientes. Volte em breve!</CardDescription>
                                    </CardHeader>
                                </Card>
                             )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
