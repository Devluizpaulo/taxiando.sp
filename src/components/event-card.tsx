
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MoveRight, MapPin, Lightbulb, TrafficCone, Phone, Share2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Event } from '@/lib/types';
import { SharePopover } from './share-buttons';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    const month = format(eventDate, "MMM", { locale: ptBR }).replace('.', '');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card id={`event-${event.id}`} className="w-full overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-lg transition-all duration-300 ease-in-out hover:border-primary hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                    <div className="flex h-40">
                        {/* Date Section */}
                        <div className="flex w-28 flex-shrink-0 flex-col items-center justify-center bg-muted/50 p-2 text-center">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} className="mb-2 rounded-md" />
                            <p className="text-4xl font-bold font-headline text-primary">{day}</p>
                            <p className="font-semibold uppercase text-muted-foreground">{month}</p>
                        </div>
                        {/* Info Section */}
                        <div className="flex flex-1 flex-col justify-between p-4">
                            <div>
                                <CardTitle className="font-headline text-lg leading-tight line-clamp-2">{event.title}</CardTitle>
                                <CardDescription className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                    {event.description}
                                </CardDescription>
                            </div>
                             <div className="text-right text-sm font-semibold text-primary">
                                Saiba Mais &rarr;
                            </div>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                 <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{event.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {event.location}
                    </DialogDescription>
                 </DialogHeader>
                 <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Descrição Completa</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><strong className="block text-foreground">Início:</strong> {format(eventDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        <p><strong className="block text-foreground">Término:</strong> {format(parseISO(event.endDate as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </div>

                    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                        <h4 className="font-bold">Dicas Táticas para Motoristas</h4>
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Lightbulb className="h-4 w-4 mt-1 flex-shrink-0 text-amber-500" />
                            <div><strong className="text-foreground">Resumo da Oportunidade: </strong>{event.driverSummary}</div>
                        </div>
                         <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Lightbulb className="h-4 w-4 mt-1 flex-shrink-0 text-amber-500" />
                            <div><strong className="text-foreground">Horários de Pico: </strong>{event.peakTimes}</div>
                        </div>
                         <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <TrafficCone className="h-4 w-4 mt-1 flex-shrink-0 text-amber-500" />
                            <div><strong className="text-foreground">Dicas de Trânsito: </strong>{event.trafficTips}</div>
                        </div>
                         <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <TrafficCone className="h-4 w-4 mt-1 flex-shrink-0 text-amber-500" />
                            <div><strong className="text-foreground">Pontos de Embarque: </strong>{event.pickupPoints}</div>
                        </div>
                    </div>
                 </div>
                 <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <a href={event.mapUrl} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2"/> Ver no Mapa
                            </a>
                        </Button>
                        {currentUrl && <SharePopover title={event.title} url={currentUrl} />}
                    </div>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
