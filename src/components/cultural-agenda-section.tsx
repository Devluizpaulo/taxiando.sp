
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Lightbulb, TrafficCone, MoveRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

async function fetchEvents(): Promise<Event[]> {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const eventsCollection = collection(db, 'events');
    const q = query(
      eventsCollection,
      where('startDate', '>=', Timestamp.fromDate(today)),
      where('startDate', '<=', Timestamp.fromDate(nextWeek)),
      orderBy('startDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  } catch (error) {
    console.error("Error fetching events: ", error);
    return [];
  }
}

export async function CulturalAgendaSection() {
  const events = await fetchEvents();

  if (events.length === 0) {
    return null;
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const startDate = (event.startDate as unknown as Timestamp)?.toDate();
            if (!startDate) return null;

            return (
              <Card key={event.id} className="flex flex-col overflow-hidden bg-card">
                <CardHeader className="p-0">
                  <div className="relative aspect-[16/9] w-full">
                    <Image src={event.imageUrl} alt={event.title} fill className="object-cover" data-ai-hint="event concert festival" />
                  </div>
                   <div className="p-6">
                    <CardTitle className="font-headline text-xl">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1"><MapPin className="h-4 w-4" /> {event.location}</CardDescription>
                   </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 px-6 pt-0">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="space-y-3 text-sm border-t pt-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                      <div>
                        <span className="font-semibold">Data:</span> {format(startDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                      <div>
                        <span className="font-semibold">Dica:</span> {event.bestTime}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrafficCone className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                      <div>
                        <span className="font-semibold">Trânsito:</span> {event.trafficTips}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                      Ver no Mapa <MoveRight className="ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
}
