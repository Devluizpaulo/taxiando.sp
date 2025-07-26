'use client';

import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Compass, ChevronDown, ChevronUp, Car, Users, Clock, ArrowRight, Star, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Event, type CityTip } from '@/lib/types';
import { EventCard } from "@/components/event-card";
import { CityTipCard } from "@/components/city-tip-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { trackContentView, trackContentShare } from '@/app/actions/analytics-actions';

// CSS para esconder scrollbar e animações
const customStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .card-hover {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .card-hover:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #f59e0b, #ea580c, #dc2626);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .glass-effect {
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite alternate;
  }
  
  @keyframes pulse-glow {
    from {
      box-shadow: 0 0 5px rgba(245, 158, 11, 0.5);
    }
    to {
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
    }
  }
  
  .slide-in {
    animation: slideIn 0.6s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default function EventsPageClient({ events, tips }: { events: Event[], tips: CityTip[] }) {
    const [expandedDate, setExpandedDate] = useState<string | null>(null);
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const driverTips = tips.filter(t => t.target === 'driver');
    const clientTips = tips.filter(t => t.target === 'client');

    // Fechar modal com ESC
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeEventModal();
            }
        };
        
        if (isModalOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const groupedEvents = events.reduce((acc, event) => {
        const dateKey = (event.startDate as string).split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    const sortedDates = Object.keys(groupedEvents).sort();
    
    // Agrupar datas em linhas de 3-4
    const dateRows = [];
    for (let i = 0; i < sortedDates.length; i += 4) {
        dateRows.push(sortedDates.slice(i, i + 4));
    }

    const toggleDate = async (date: string) => {
        setLoadingStates(prev => ({ ...prev, [date]: true }));
        
        // Simular loading para melhor UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setExpandedDate(expandedDate === date ? null : date);
        setLoadingStates(prev => ({ ...prev, [date]: false }));
    };

    const openEventModal = (event: Event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
        
        // Track content view
        trackContentView('event', event.id, event.title);
    };

    const closeEventModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />
            <PublicHeader />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                    <div className="mb-12 text-center slide-in">
                        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl gradient-text mb-4">
                            Eventos
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 leading-relaxed">
                            Explore os principais eventos, dicas de gastronomia e lazer para aproveitar São Paulo ao máximo.
                        </p>
                    </div>

                     <Tabs defaultValue="events" className="w-full slide-in">
                        <TabsList className="w-full h-16 bg-gradient-to-r from-slate-100 via-gray-50 to-zinc-100 p-1 rounded-2xl shadow-xl border border-slate-200/50">
                            <TabsTrigger 
                                value="events" 
                                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-500 rounded-xl font-semibold text-base flex items-center gap-2 group hover:bg-amber-50 hover:text-amber-700 hover:scale-102"
                            >
                                <div className="relative">
                                    <Calendar className="h-5 w-5 group-data-[state=active]:animate-bounce" />
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse group-data-[state=active]:bg-white"></div>
                                </div>
                                <span>Eventos da Semana</span>
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="events" className="mt-8">
                             {events.length > 0 ? (
                                <div className="space-y-8">
                                    {dateRows.map((dateRow, rowIndex) => (
                                        <div key={rowIndex} className="space-y-6 slide-in" style={{ animationDelay: `${rowIndex * 100}ms` }}>
                                            {/* Linha de datas */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {dateRow.map((date) => {
                                                    const isExpanded = expandedDate === date;
                                                    const eventCount = groupedEvents[date].length;
                                                    const isToday = format(parseISO(date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                                                    const isLoading = loadingStates[date];
                                                    
                                                    return (
                                                        <div key={date} className="space-y-4">
                                                            {/* Card da data com eventos */}
                                                            <Card 
                                                                className={`card-hover ${
                                                                    isExpanded ? 'ring-2 ring-amber-500 shadow-2xl scale-105 pulse-glow' : 'hover:shadow-xl'
                                                                } ${isToday ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200' : 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 border-slate-200'}`}
                                                            >
                                                                <CardContent className="p-0 overflow-hidden">
                                                                    {/* Header principal refinado */}
                                                                    <div className={`relative h-28 ${isToday 
                                                                        ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500' 
                                                                        : 'bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-700'
                                                                    }`}>
                                                                        {/* Padrão de fundo elegante */}
                                                                        <div className="absolute inset-0 opacity-15">
                                                                            <div className="absolute top-2 left-2 w-4 h-4 border border-white/20 rounded-full"></div>
                                                                            <div className="absolute top-6 right-4 w-2 h-2 border border-white/20 rounded-full"></div>
                                                                            <div className="absolute bottom-6 left-6 w-3 h-3 border border-white/20 rounded-full"></div>
                                                                            <div className="absolute bottom-2 right-2 w-4 h-4 border border-white/20 rounded-full"></div>
                                                                        </div>
                                                                        
                                                                        {/* Overlay de gradiente sutil */}
                                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                                                                        
                                                                        {/* Badge de destaque para hoje */}
                                                                        {isToday && (
                                                                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                                                                                <span className="text-white text-xs font-bold">HOJE</span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        <div className="relative h-full flex items-center justify-between px-4">
                                                                            <div className="flex items-center gap-3">
                                                                                {/* Ícone de calendário elegante */}
                                                                                <div className="relative">
                                                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl glass-effect ${
                                                                                        isToday ? 'shadow-lg' : 'shadow-md'
                                                                                    }`}>
                                                                                        <Calendar className="h-6 w-6 text-white drop-shadow-sm" />
                                                                                    </div>
                                                                                    {isToday && (
                                                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                <div className="space-y-1">
                                                                                    <h3 className="font-bold text-lg capitalize text-white drop-shadow-sm">
                                                                                        {format(parseISO(date), "EEEE", { locale: ptBR })}
                                                                                    </h3>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className="text-white/90 text-sm font-medium">
                                                                                            {format(parseISO(date), "dd", { locale: ptBR })}
                                                                                        </span>
                                                                                        <span className="text-white/60 text-xs">•</span>
                                                                                        <span className="text-white/90 text-sm capitalize font-medium">
                                                                                            {format(parseISO(date), "MMM", { locale: ptBR })}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* Contador simplificado */}
                                                                            <div className="flex flex-col items-end gap-2">
                                                                                <div className={`px-2 py-1 rounded-full text-xs font-bold glass-effect ${
                                                                                    isToday ? 'text-white shadow-sm' : 'text-white/90'
                                                                                }`}>
                                                                                    {eventCount}
                                                                                </div>
                                                                                
                                                                                {/* Indicador de múltiplos eventos */}
                                                                                {eventCount > 1 && (
                                                                                    <div className="flex gap-1">
                                                                                        {Array.from({ length: Math.min(eventCount, 4) }).map((_, i) => (
                                                                                            <div 
                                                                                                key={i} 
                                                                                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                                                                                    isToday 
                                                                                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse' 
                                                                                                        : 'bg-gradient-to-r from-slate-400 to-gray-500'
                                                                                                }`}
                                                                                                style={{
                                                                                                    animationDelay: `${i * 150}ms`
                                                                                                }}
                                                                                            ></div>
                                                                                        ))}
                                                                                        {eventCount > 4 && (
                                                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 text-xs flex items-center justify-center">
                                                                                                <span className="text-[8px] text-white">+</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {/* Logo discreto */}
                                                                                <div className="w-8 h-8 glass-effect rounded-lg flex items-center justify-center">
                                                                                    <Image 
                                                                                        src="/logo.png" 
                                                                                        alt="Logo" 
                                                                                        width={16} 
                                                                                        height={16} 
                                                                                        className="rounded-sm" 
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Lista de eventos da data */}
                                                                    <div className="p-4">
                                                                        {/* Header com contador */}
                                                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                                                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                                                    {eventCount} evento{eventCount > 1 ? 's' : ''} programado{eventCount > 1 ? 's' : ''}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-xs text-slate-500">
                                                                                {isToday ? '🎉 Hoje!' : '📅 Eventos'}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Lista de eventos ordenados por horário */}
                                                                        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                                                                            {groupedEvents[date]
                                                                                .sort((a, b) => new Date(a.startDate as string).getTime() - new Date(b.startDate as string).getTime())
                                                                                .map((event, index) => {
                                                                                const eventStartDate = new Date(event.startDate as string);
                                                                                const eventTime = format(eventStartDate, 'HH:mm');
                                                                                const isLast = index === groupedEvents[date].length - 1;
                                                                                
                                                                                return (
                                                                                    <div key={event.id} className="relative">
                                                                                        {/* Separador visual entre eventos */}
                                                                                        {index > 0 && (
                                                                                            <div className="absolute -top-1 left-6 w-px h-2 bg-gradient-to-b from-transparent to-slate-300"></div>
                                                                                        )}
                                                                                        
                                                                                        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-amber-300 group">
                                                                                            <div className="flex items-start justify-between gap-3">
                                                                                                {/* Informações do evento */}
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                                        <div className="relative">
                                                                                                            <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                                                                            {/* Indicador de próximo evento */}
                                                                                                            {index === 0 && (
                                                                                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse"></div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                        <span className="text-sm font-bold text-slate-700">{eventTime}h</span>
                                                                                                        <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                                                                            <Image 
                                                                                                                src="/logo.png" 
                                                                                                                alt="Logo" 
                                                                                                                width={12} 
                                                                                                                height={12} 
                                                                                                                className="rounded-sm" 
                                                                                                            />
                                                                                                        </div>
                                                                                                        {/* Badge de destaque para primeiro evento */}
                                                                                                        {index === 0 && (
                                                                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                                                                                PRÓXIMO
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    
                                                                                                    <h4 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
                                                                                                        {event.title}
                                                                                                    </h4>
                                                                                                    
                                                                                                    <p className="text-xs text-slate-600 line-clamp-2">
                                                                                                        {event.description || event.location}
                                                                                                    </p>
                                                                                                </div>
                                                                                                
                                                                                                {/* Botão Saiba Mais */}
                                                                                                <button 
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        openEventModal(event);
                                                                                                    }}
                                                                                                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex-shrink-0 group-hover:scale-105"
                                                                                                >
                                                                                                    Saiba Mais
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                        
                                                                                        {/* Separador final */}
                                                                                        {!isLast && (
                                                                                            <div className="absolute -bottom-1 left-6 w-px h-2 bg-gradient-to-b from-slate-300 to-transparent"></div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        
                                                                        {/* Footer com call-to-action */}
                                                                        {eventCount > 3 && (
                                                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                                                <div className="text-center">
                                                                                    <span className="text-xs text-slate-500">
                                                                                        +{eventCount - 3} mais eventos • Clique para expandir
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                            
                                                            {/* Área expandida com eventos melhorados */}
                                                            {isExpanded && (
                                                                <div className="relative slide-in">
                                                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                                                        {groupedEvents[date].map((event, index) => (
                                                                            <div key={event.id} className="flex-shrink-0 w-80">
                                                                                <EnhancedEventCard 
                                                                                    event={event} 
                                                                                    index={index} 
                                                                                    onOpenModal={openEventModal}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    
                                                                    {/* Gradientes nas bordas */}
                                                                    <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                                                                    <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                                                                    
                                                                    {/* Indicador de scroll */}
                                                                    {eventCount > 2 && (
                                                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-xs text-white font-medium shadow-lg">
                                                                            ← Deslize →
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Card className="py-16 text-center mt-8 slide-in">
                                    <CardHeader>
                                        <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                                        <CardTitle className="text-slate-700">Nenhum evento programado</CardTitle>
                                        <CardDescription className="text-slate-500">A agenda da semana ainda está sendo preparada. Volte em breve!</CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <PublicFooter />
            
            {/* Modal do Evento */}
            {isModalOpen && selectedEvent && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeEventModal();
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
                        <EventModal event={selectedEvent} onClose={closeEventModal} />
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente de evento melhorado
function EnhancedEventCard({ event, index, onOpenModal }: { event: Event, index: number, onOpenModal: (event: Event) => void }) {
    const startDate = new Date(event.startDate as string);
    const time = format(startDate, 'HH:mm');
    const date = format(startDate, 'dd MMM', { locale: ptBR }).toUpperCase();
    
    return (
        <Card className="card-hover overflow-hidden border-0 shadow-2xl bg-white">
            <CardContent className="p-0">
                {/* Header com hora em destaque - Design elegante */}
                <div className="relative h-28 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
                    {/* Padrão de fundo elegante */}
                    <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-3 left-3 w-6 h-6 border border-white/20 rounded-full"></div>
                        <div className="absolute top-8 right-6 w-3 h-3 border border-white/20 rounded-full"></div>
                        <div className="absolute bottom-6 left-8 w-4 h-4 border border-white/20 rounded-full"></div>
                        <div className="absolute bottom-3 right-3 w-5 h-5 border border-white/20 rounded-full"></div>
                    </div>
                    
                    {/* Overlay de gradiente sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                    
                    <div className="relative h-full flex items-center justify-between px-5">
                        {/* Hora em destaque */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass-effect shadow-xl">
                                    <Clock className="h-7 w-7 text-white drop-shadow-sm" />
                                </div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-xl"></div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-white/70 text-xs font-medium tracking-wider">HORÁRIO</div>
                                <div className="text-white text-2xl font-bold tracking-wider drop-shadow-sm">{time}h</div>
                            </div>
                        </div>
                        
                        {/* Logo em destaque */}
                        <div className="flex flex-col items-end gap-3">
                            <div className="relative">
                                <div className="w-14 h-14 glass-effect rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                                    <Image 
                                        src="/logo.png" 
                                        alt="Logo" 
                                        width={28} 
                                        height={28} 
                                        className="rounded-sm drop-shadow-sm" 
                                    />
                                </div>
                                {/* Glow effect para logo */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/30 to-orange-400/30 blur-xl"></div>
                            </div>
                            <div className="px-3 py-1.5 bg-white/25 backdrop-blur-sm rounded-xl border border-white/40 shadow-lg">
                                <span className="text-white text-xs font-bold tracking-wider">{date}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Conteúdo principal */}
                <div className="p-6 space-y-5">
                    {/* Título do evento */}
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2">
                            {event.title}
                        </h3>
                    </div>
                    
                    {/* Local com endereço completo */}
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 rounded-xl border border-slate-200/50 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-slate-700 mb-2 tracking-wider">LOCAL</div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {event.location}
                            </p>
                            {/* Endereço completo se disponível */}
                            {event.location.includes('Allianz Parque') && (
                                <div className="mt-2 p-2 bg-white/50 rounded-lg border border-slate-200">
                                    <p className="text-xs text-slate-500">
                                        Avenida Francisco Matarazzo, 1705 - Água Branca, São Paulo - SP, 05001-200, Brasil
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Descrição detalhada */}
                    {event.description && (
                        <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl border border-amber-200/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                                <div className="text-xs font-bold text-amber-700 tracking-wider">DESCRIÇÃO</div>
                            </div>
                            <p className="text-sm text-amber-800 leading-relaxed line-clamp-4">
                                {event.description}
                            </p>
                            {/* Descrição completa para Sorriso Maroto */}
                            {event.title.includes('Sorriso Maroto') && (
                                <div className="mt-3 p-3 bg-amber-100/50 rounded-lg border border-amber-300/50">
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Prepare-se para dois dias de muita nostalgia com o Sorriso Maroto no Allianz Parque! Reviva os maiores sucessos do grupo em um show inesquecível nos dias 02 e 03 de agosto.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Dicas para Motoristas - Se for Sorriso Maroto */}
                    {event.title.includes('Sorriso Maroto') && (
                        <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl border border-emerald-200/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                                <div className="text-xs font-bold text-emerald-700 tracking-wider">DICAS PARA MOTORISTAS</div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-2 bg-emerald-100/50 rounded-lg">
                                    <div className="text-xs font-bold text-emerald-700 mb-1">🎯 OPORTUNIDADE</div>
                                    <p className="text-xs text-emerald-700">Grande oportunidade de ganhos! Show atrairá público grande e animado.</p>
                                </div>
                                <div className="p-2 bg-emerald-100/50 rounded-lg">
                                    <div className="text-xs font-bold text-emerald-700 mb-1">⏰ HORÁRIOS DE PICO</div>
                                    <p className="text-xs text-emerald-700">Abertura 15h, pico 18h-19h, término 23h30 (maior demanda).</p>
                                </div>
                                <div className="p-2 bg-emerald-100/50 rounded-lg">
                                    <div className="text-xs font-bold text-emerald-700 mb-1">🚗 TRÂNSITO</div>
                                    <p className="text-xs text-emerald-700">Use Av. Pompéia e Rua Padre Chico como alternativas.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Botão "Saiba Mais" funcional */}
                    <a 
                        href={`#event-${event.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpenModal(event);
                        }}
                        className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white text-sm font-bold rounded-2xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 transition-all duration-500 flex items-center justify-center gap-3 group shadow-xl hover:shadow-2xl transform hover:scale-105 relative overflow-hidden cursor-pointer"
                    >
                        {/* Overlay de brilho */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        
                        <span className="relative z-10 tracking-wider">SAIBA MAIS</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}

export function EventModal({ event, onClose }: { event: Event, onClose: () => void }) {
    const [showShareOptions, setShowShareOptions] = useState(false);
    const startDate = new Date(event.startDate as string);
    const time = format(startDate, 'HH:mm');
    const date = format(startDate, 'dd/MM/yyyy', { locale: ptBR });
    const fullDate = format(startDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    
    // Funções de compartilhamento
    const shareToWhatsApp = (event: Event) => {
        const text = `🎉 ${event.title}\n\n📍 ${event.location}\n⏰ ${date} às ${time}h\n\nConfira mais detalhes: ${window.location.href}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        
        // Track share
        trackContentShare('event', event.id, 'whatsapp');
    };
    
    const shareToTwitter = (event: Event) => {
        const text = `🎉 ${event.title}\n\n📍 ${event.location}\n⏰ ${date} às ${time}h\n\nConfira mais detalhes: ${window.location.href}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        
        // Track share
        trackContentShare('event', event.id, 'twitter');
    };
    
    const shareToFacebook = (event: Event) => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
        
        // Track share
        trackContentShare('event', event.id, 'facebook');
    };
    
    const copyToClipboard = async (event: Event) => {
        const text = `🎉 ${event.title}\n\n📍 ${event.location}\n⏰ ${date} às ${time}h\n\nConfira mais detalhes: ${window.location.href}`;
        try {
            await navigator.clipboard.writeText(text);
            alert('Link copiado para a área de transferência!');
            
            // Track share
            trackContentShare('event', event.id, 'copy_link');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            alert('Erro ao copiar link');
        }
    };
    
    // Função para abrir no Google Maps
    const openInGoogleMaps = (event: Event) => {
        let address = '';
        
        // Mapear endereços específicos para coordenadas
        if (event.location.includes('Allianz Parque')) {
            address = 'Allianz Parque, Avenida Francisco Matarazzo, 1705 - Água Branca, São Paulo - SP, 05001-200, Brasil';
        } else if (event.location.includes('Ibirapuera')) {
            address = 'Parque Ibirapuera, São Paulo - SP, Brasil';
        } else if (event.location.includes('Villa-Lobos')) {
            address = 'Parque Villa-Lobos, São Paulo - SP, Brasil';
        } else {
            // Usar o endereço do evento se não for um local específico
            address = event.location;
        }
        
        // Detectar se é mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let mapsUrl = '';
        
        if (isMobile) {
            // Tentar abrir o app nativo do Google Maps no mobile
            mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
        } else {
            // Desktop: usar a versão web
            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        }
        
        // Abrir em nova aba
        window.open(mapsUrl, '_blank');
    };
    
    const [copied, setCopied] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeInUp">
            <div className="relative w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-xl border border-white/30 flex flex-col max-h-[98vh] overflow-hidden">
                {/* Marca d'água do logo */}
                <Image
                    src="/logo.png"
                    alt="Marca d'água"
                    fill
                    className="absolute inset-0 w-full h-full object-contain opacity-5 pointer-events-none select-none z-0"
                    style={{ filter: 'blur(0.5px)' }}
                />
                {/* Header fixo com botão de fechar */}
                <div className="sticky top-0 z-20 flex items-center justify-between p-4 md:p-6 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                    <div>
                        <h2 className="font-bold text-xl md:text-2xl text-slate-900 leading-tight">
                            {event.title}
                        </h2>
                        <div className="flex items-center gap-2 text-slate-600 text-xs md:text-sm mt-1">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 shadow transition"
                        aria-label="Fechar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {/* Conteúdo scrollável */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent relative z-10">
                    {/* Descrição Completa */}
                    <div>
                        <h3 className="text-lg font-semibold text-amber-700 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            Descrição Completa
                        </h3>
                        <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                            {event.description}
                        </p>
                    </div>
                    {/* Data e Hora */}
                    <div className="flex items-center gap-2 text-slate-700 border-t pt-4">
                        <Calendar className="h-5 w-5 text-blue-500 animate-bounce" />
                        <span className="font-semibold">Data e Hora:</span>
                        <span className="ml-2">{date} às {time}h</span>
                    </div>
                    {/* Dicas Táticas para Motoristas */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Dicas Táticas para Motoristas
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3 items-start">
                                <span className="mt-1"><Star className="h-5 w-5 text-orange-500 animate-spin-slow" /></span>
                                <div>
                                    <span className="font-bold text-slate-800">Resumo da Oportunidade:</span>
                                    <span className="text-slate-700 ml-1">Grande oportunidade de ganhos! Show do Sorriso Maroto atrairá um público grande e animado ao Allianz Parque. Prepare-se para alta demanda, especialmente no término do evento.</span>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="mt-1"><Clock className="h-5 w-5 text-orange-500 animate-pulse" /></span>
                                <div>
                                    <span className="font-bold text-slate-800">Horários de Pico:</span>
                                    <span className="text-slate-700 ml-1">Abertura dos portões às 15h com movimento crescente. O pico será entre 18h e 19h para chegada. O término do show às 23h30 concentrará o maior número de passageiros.</span>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="mt-1"><ChevronRight className="h-5 w-5 text-orange-500 animate-bounce" /></span>
                                <div>
                                    <span className="font-bold text-slate-800">Dicas de Trânsito:</span>
                                    <span className="text-slate-700 ml-1">A Avenida Francisco Matarazzo e as ruas ao redor do Allianz Parque estarão congestionadas. Utilize a Avenida Pompéia e a Rua Padre Chico como alternativas. Evite a região central da Água Branca após o show.</span>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="mt-1"><MapPin className="h-5 w-5 text-orange-500 animate-pulse" /></span>
                                <div>
                                    <span className="font-bold text-slate-800">Pontos de Embarque:</span>
                                    <span className="text-slate-700 ml-1">Use os bolsões de embarque designados pela CET: Av. Francisco Matarazzo (entre Av. Pompéia e Praça Des. Washington de Barros Monteiro), Av. Pompéia (entre Rua Palestra Itália e Rua Padre Chico), Av. Antártica, Rua Turiassú e Av. Sumaré (próximo à Praça Marrey Junior).</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* Footer glass fixo */}
                <div className="sticky bottom-0 z-20 p-4 md:p-6 border-t border-slate-200 bg-white/80 backdrop-blur-xl flex-shrink-0 shadow-xl">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                            <button 
                                onClick={() => openInGoogleMaps(event)}
                                className="flex items-center gap-2 px-5 py-3 bg-white/70 border border-slate-300 rounded-xl hover:bg-slate-100 shadow-md text-base font-semibold text-blue-700 transition-colors backdrop-blur-xl"
                            >
                                <MapPin className="h-5 w-5 text-blue-500" />
                                Ver no Mapa
                            </button>
                            <button 
                                onClick={() => setShowShareOptions(!showShareOptions)}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-md text-base font-semibold text-white transition-colors"
                                title="Compartilhar"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                </svg>
                                Compartilhar
                            </button>
                        </div>
                        {showShareOptions && (
                            <div className="pt-2 border-t border-slate-200">
                                <div className="text-center mb-3 font-semibold text-slate-700">
                                    Compartilhe este evento com seus amigos!
                                </div>
                                <div className="flex justify-center gap-4 mb-2">
                                    {/* WhatsApp */}
                                    <button 
                                        onClick={() => shareToWhatsApp(event)}
                                        className="p-3 bg-green-500 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition transform duration-200"
                                        title="Compartilhar no WhatsApp"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                        </svg>
                                    </button>
                                    {/* Twitter/X */}
                                    <button 
                                        onClick={() => shareToTwitter(event)}
                                        className="p-3 bg-black rounded-full shadow-lg hover:bg-gray-800 hover:scale-110 transition transform duration-200"
                                        title="Compartilhar no Twitter/X"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                    </button>
                                    {/* Facebook */}
                                    <button 
                                        onClick={() => shareToFacebook(event)}
                                        className="p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition transform duration-200"
                                        title="Compartilhar no Facebook"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    </button>
                                    {/* Copiar Link */}
                                    <button 
                                        onClick={async () => {
                                            await copyToClipboard(event);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className={`p-3 bg-slate-600 rounded-full shadow-lg border-2 border-blue-500 hover:bg-slate-700 hover:scale-110 transition transform duration-200 ${copied ? 'animate-pulse' : ''}`}
                                        title="Copiar Link"
                                    >
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                        </svg>
                                    </button>
                                </div>
                                {copied && (
                                    <div className="text-green-600 text-xs mt-1 animate-pulse">Link copiado! Pronto para compartilhar 🚀</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 