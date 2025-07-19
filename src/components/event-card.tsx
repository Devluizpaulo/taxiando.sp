
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Event } from '@/lib/types';
import { EventModal } from '@/app/events/events-client-page';

export const EventCard = ({ event }: { event: Event }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const startDate = new Date(event.startDate as string);
    const time = format(startDate, 'HH:mm');
    const date = format(startDate, 'dd MMM', { locale: ptBR }).toUpperCase();

    return (
        <>
            <Card className="card-hover overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-2xl relative">
                {/* Marca d'água */}
                <Image
                    src="/logo.png"
                    alt="Marca d'água"
                    fill
                    className="absolute inset-0 w-full h-full object-contain opacity-5 pointer-events-none select-none z-0"
                    style={{ filter: 'blur(0.5px)' }}
                />
                <CardContent className="p-0 relative z-10">
                    {/* Header com hora e logo */}
                    <div className="relative h-24 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-between px-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl glass-effect shadow-xl">
                                <Clock className="h-6 w-6 text-white drop-shadow-sm" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-white/70 text-xs font-medium tracking-wider">HORÁRIO</div>
                                <div className="text-white text-xl font-bold tracking-wider drop-shadow-sm">{time}h</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="w-10 h-10 glass-effect rounded-xl flex items-center justify-center shadow-xl border border-white/30">
                                <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-sm drop-shadow-sm" />
                            </div>
                            <div className="px-2 py-1 bg-white/25 backdrop-blur-sm rounded-xl border border-white/40 shadow-lg">
                                <span className="text-white text-xs font-bold tracking-wider">{date}</span>
                            </div>
                        </div>
                    </div>
                    {/* Conteúdo principal */}
                    <div className="p-5 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 line-clamp-2">
                            {event.title}
                        </h3>
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 rounded-xl border border-slate-200/50 shadow-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                                <MapPin className="h-4 w-4 text-white" />
                    </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-slate-700 mb-1 tracking-wider">LOCAL</div>
                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                    {event.location}
                                </p>
                    </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                            {event.description}
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full mt-4 px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white text-sm font-bold rounded-2xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 transition-all duration-500 flex items-center justify-center gap-3 group shadow-xl hover:shadow-2xl transform hover:scale-105 relative overflow-hidden cursor-pointer"
                        >
                            <span className="relative z-10 tracking-wider">SAIBA MAIS</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                        </button>
                        </div>
                </CardContent>
            </Card>
            {isModalOpen && (
                <EventModal event={event} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
};

export function PosterEventCard({ event }: { event: Event }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const startDate = new Date(event.startDate as string);
    const time = format(startDate, 'HH:mm');
    const date = format(startDate, 'dd MMM', { locale: ptBR }).toUpperCase();

    return (
        <>
            <div className="relative group w-56 sm:w-64">
                {/* Moldura gradiente com pseudo-elemento before */}
                <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 group-hover:from-orange-500 group-hover:to-amber-400 transition-all duration-300 z-0 pointer-events-none"></div>
                <Card className="flex flex-col items-center bg-white/70 backdrop-blur-xl rounded-2xl border-0 p-0 overflow-hidden relative z-10 shadow-xl shadow-orange-100 hover:shadow-2xl hover:shadow-orange-300 hover:-translate-y-2 hover:scale-105 animate-fadeInUp">
                    {/* Logo no topo */}
                    <div className="w-full flex justify-center pt-5 pb-2">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-md" />
                        </div>
                    </div>
                    {/* Hora e data */}
                    <div className="flex flex-col items-center mt-2 mb-2">
                        <span className="text-xs font-bold text-amber-700 tracking-widest">{date}</span>
                        <span className="text-lg font-extrabold text-slate-900 drop-shadow">{time}h</span>
                    </div>
                    {/* Título */}
                    <div className="px-3 text-center mb-1">
                        <h3 className="font-bold text-base text-slate-800 leading-tight line-clamp-2 drop-shadow-sm">{event.title}</h3>
                 </div>
                    {/* Local */}
                    <div className="flex items-center gap-1 text-xs text-slate-500 px-3 mb-2">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        <span className="line-clamp-1">{event.location}</span>
                    </div>
                    {/* Botão Saiba Mais */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 mb-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow group-hover:scale-110 group-hover:shadow-lg"
                    >
                        Saiba Mais <ArrowRight className="h-4 w-4" />
                    </button>
                </Card>
            </div>
            {isModalOpen && (
                <EventModal event={event} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}
