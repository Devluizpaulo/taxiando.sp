

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MoveRight, MapPin, Lightbulb, TrafficCone, Share2, Clock, Calendar } from 'lucide-react';
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
    const time = format(eventDate, "HH:mm");

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card id={`event-${event.id}`} className="group w-full overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-lg transition-all duration-300 ease-in-out hover:border-primary hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                    <div className="flex h-36">
                        <div className="flex w-24 flex-shrink-0 flex-col items-center justify-center bg-muted/50 p-2 text-center">
                            <Image src="/logo.png" alt="Logo" width={24} height={24} className="mb-2 rounded-md" />
                            <p className="text-3xl font-bold font-headline text-primary">{day}</p>
                            <p className="font-semibold uppercase text-muted-foreground">{month}</p>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-4">
                            <div>
                                <CardTitle className="font-headline text-lg leading-tight line-clamp-2">{event.title}</CardTitle>
                                <CardDescription className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3" /> {event.location}
                                </CardDescription>
                                <CardDescription className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> Início às {time}h
                                </CardDescription>
                            </div>
                            <div className="text-right text-sm font-semibold text-primary flex items-center justify-end gap-1 mt-2">
                                Saiba Mais <MoveRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                 {/* Watermark in the background. */}
                 <Image
                    src="/logo.png"
                    alt="Táxiando SP Watermark"
                    width={350}
                    height={350}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none"
                    priority
                />
                 {/* The rest of the content will render on top of the watermark */}
                 <DialogHeader className="p-6 pb-4 border-b bg-background/90 backdrop-blur-sm z-10">
                    <DialogTitle className="font-headline text-2xl">{event.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {event.location}
                    </DialogDescription>
                 </DialogHeader>
                 <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
                    <div>
                        <h4 className="font-semibold mb-2">Descrição Completa</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/> <strong className="text-foreground">Data e Hora:</strong> {format(eventDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}h</p>
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
                 <DialogFooter className="p-6 pt-4 border-t bg-background/90 backdrop-blur-sm flex-col sm:flex-row sm:justify-between items-center w-full z-10">
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
