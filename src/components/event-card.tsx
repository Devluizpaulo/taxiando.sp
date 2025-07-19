

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
                <Card id={`event-${event.id}`} className="group overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-lg transition-all duration-300 ease-in-out hover:border-primary hover:shadow-2xl hover:-translate-y-1 cursor-pointer h-96">
                    <div className="relative h-full">
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background/80"></div>
                        
                        {/* Date badge */}
                        <div className="absolute top-4 left-4 z-10">
                            <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-center shadow-lg">
                                <div className="text-2xl font-bold">{day}</div>
                                <div className="text-xs font-semibold uppercase">{month}</div>
                            </div>
                        </div>
                        
                        {/* Time badge */}
                        <div className="absolute top-4 right-4 z-10">
                            <div className="bg-background/90 backdrop-blur-sm text-foreground rounded-lg px-3 py-2 text-center shadow-lg border">
                                <div className="text-sm font-semibold">{time}h</div>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-end p-6">
                            <div className="space-y-3">
                                <CardTitle className="font-headline text-xl leading-tight line-clamp-2 text-foreground drop-shadow-sm">
                                    {event.title}
                                </CardTitle>
                                
                                <CardDescription className="text-sm text-muted-foreground flex items-center gap-1.5 drop-shadow-sm">
                                    <MapPin className="h-4 w-4" /> 
                                    <span className="line-clamp-1">{event.location}</span>
                                </CardDescription>
                                
                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-sm font-semibold text-primary flex items-center gap-1">
                                        Saiba Mais <MoveRight className="h-4 w-4" />
                                    </div>
                                    
                                    {/* Logo */}
                                    <div className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                        <Image src="/logo.png" alt="Logo" width={20} height={20} className="rounded-md" />
                                    </div>
                            </div>
                            </div>
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></div>
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
