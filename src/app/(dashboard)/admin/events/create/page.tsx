
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Calendar, Lightbulb, TrafficCone, MoveRight, Sparkles } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import { planEvent } from '@/ai/flows/event-planner-flow';
import { uploadImageFromDataUrl } from '@/app/actions/storage-actions';


const eventFormSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  description: z.string().min(20, { message: "A descrição deve ter pelo menos 20 caracteres." }),
  location: z.string().min(3, { message: "O local é obrigatório." }),
  imageUrl: z.string().min(1, "A URL ou os dados da imagem são obrigatórios."),
  startDate: z.date({ required_error: "A data de início é obrigatória." }),
  endDate: z.date({ required_error: "A data de término é obrigatória." }),
  driverSummary: z.string().min(5, { message: "O resumo tático é obrigatório." }),
  peakTimes: z.string().min(5, { message: "A dica de horários de pico é obrigatória." }),
  trafficTips: z.string().min(5, { message: "A dica de trânsito é obrigatória." }),
  pickupPoints: z.string().min(5, { message: "A sugestão de pontos de embarque é obrigatória." }),
  mapUrl: z.string().min(1, "A URL do mapa é obrigatória."),
}).refine(data => data.endDate >= data.startDate, {
  message: "A data de término deve ser posterior ou igual à data de início.",
  path: ["endDate"],
});


type EventFormValues = z.infer<typeof eventFormSchema>;

const EventPreviewCard = ({ title, location, imageUrl, description, startDate, peakTimes, trafficTips }: Partial<EventFormValues>) => {
    return (
        <Card className="flex flex-col overflow-hidden bg-card shadow-lg">
            <CardHeader className="p-0">
                <div className="relative aspect-[16/9] w-full bg-muted">
                    <img 
                        src={imageUrl || 'https://placehold.co/800x450.png'}
                        alt={title || "Preview do Evento"} 
                        className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x450.png'; }}
                    />
                </div>
                <div className="p-4">
                    <CardTitle className="font-headline text-lg truncate">{title || "Título do Seu Evento"}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1 truncate">
                        <MapPin className="h-4 w-4 flex-shrink-0" /> 
                        {location || "Localização do evento"}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 px-4 pt-0 text-xs">
                <p className="text-muted-foreground line-clamp-2">{description || "A descrição completa do seu evento aparecerá aqui."}</p>
                <div className="space-y-2 text-xs border-t pt-3">
                    <div className="flex items-start gap-2">
                        <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5 text-primary" />
                        <div>
                            <span className="font-semibold">Data:</span> {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "dd/mm/aaaa"}
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5 text-primary" />
                        <div className="truncate">
                            <span className="font-semibold">Pico:</span> {peakTimes || "Horários de pico"}
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <TrafficCone className="h-3 w-3 flex-shrink-0 mt-0.5 text-primary" />
                        <div className="truncate">
                            <span className="font-semibold">Trânsito:</span> {trafficTips || "Dicas de trânsito"}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="px-4 pb-4">
                <Button variant="outline" className="w-full" disabled size="sm">
                    Ver no Mapa <MoveRight className="ml-2"/>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default function CreateEventPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            description: '',
            location: '',
            imageUrl: '',
            driverSummary: '',
            peakTimes: '',
            trafficTips: '',
            pickupPoints: '',
            mapUrl: '',
        },
    });

    const watchedValues = form.watch();

    const handleGenerateDetails = async () => {
        setIsGenerating(true);
        toast({
            title: "Buscando informações...",
            description: "A IA está gerando os detalhes do evento. Isso pode levar alguns segundos.",
        });
        try {
            const result = await planEvent({ eventQuery: searchQuery });
            
            form.setValue('title', result.title, { shouldValidate: true });
            form.setValue('location', result.location, { shouldValidate: true });
            form.setValue('description', result.description, { shouldValidate: true });
            form.setValue('imageUrl', result.imageUrl, { shouldValidate: true });
            form.setValue('mapUrl', result.mapUrl, { shouldValidate: true });
            form.setValue('driverSummary', result.driverSummary, { shouldValidate: true });
            form.setValue('peakTimes', result.peakTimes, { shouldValidate: true });
            form.setValue('trafficTips', result.trafficTips, { shouldValidate: true });
            form.setValue('pickupPoints', result.pickupPoints, { shouldValidate: true });

            toast({
                title: "Detalhes Preenchidos!",
                description: "O formulário foi preenchido com as informações geradas pela IA.",
            });

        } catch (error) {
            console.error("Error generating event details: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Gerar Detalhes',
                description: 'Não foi possível buscar as informações. Por favor, tente novamente ou preencha manually.',
            });
        } finally {
            setIsGenerating(false);
        }
    };


    const onSubmit = async (values: EventFormValues) => {
        setIsSubmitting(true);
        try {
            const eventId = nanoid();
            let finalImageUrl = values.imageUrl;

            // If the imageUrl is a data URI, upload it via the server action to bypass CORS
            if (values.imageUrl.startsWith('data:image')) {
                toast({ title: "Processando imagem...", description: "O upload da imagem está sendo feito no servidor." });

                const uploadResult = await uploadImageFromDataUrl(values.imageUrl, 'events');
                
                if (uploadResult.success) {
                    finalImageUrl = uploadResult.url;
                } else {
                    // If upload fails, show an error and stop submission
                    toast({
                        variant: 'destructive',
                        title: 'Erro no Upload da Imagem',
                        description: `Falha ao enviar a imagem: ${uploadResult.error}`,
                        duration: 8000,
                    });
                    setIsSubmitting(false);
                    return; // Stop execution
                }
            }
            
            const eventData = {
                id: eventId,
                title: values.title,
                description: values.description,
                location: values.location,
                imageUrl: finalImageUrl,
                startDate: Timestamp.fromDate(values.startDate),
                endDate: Timestamp.fromDate(values.endDate),
                driverSummary: values.driverSummary,
                peakTimes: values.peakTimes,
                trafficTips: values.trafficTips,
                pickupPoints: values.pickupPoints,
                mapUrl: values.mapUrl,
                createdAt: serverTimestamp(),
            };
            
            await setDoc(doc(db, 'events', eventId), eventData);

            toast({
                title: 'Evento Criado com Sucesso!',
                description: `O evento "${values.title}" foi salvo e já está visível.`,
            });
            router.push('/admin/events');

        } catch (error) {
            console.error("Error creating event: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Criar Evento',
                description: 'Não foi possível salvar o evento no banco de dados. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-8">
                     <div>
                        <h1 className="font-headline text-3xl font-bold tracking-tight">Criador de Eventos</h1>
                        <p className="text-muted-foreground">Use o assistente de IA ou preencha os campos manualmente.</p>
                    </div>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Assistente de IA para Eventos</CardTitle>
                            <CardDescription>Digite a descrição de um evento (ex: "Show da Taylor Swift no Allianz Parque, 45 mil pessoas...") e deixe a IA preencher os detalhes para você.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Textarea 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Descreva o evento aqui..."
                                disabled={isGenerating}
                                rows={3}
                                />
                                <Button type="button" onClick={handleGenerateDetails} disabled={isGenerating || !searchQuery} className="self-end">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {isGenerating ? 'Gerando...' : 'Gerar Detalhes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 flex flex-col gap-8">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Informações do Evento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem><FormLabel>Título do Evento</FormLabel><FormControl><Input {...field} placeholder="Ex: Virada Cultural Paulista" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="location" render={({ field }) => (
                                        <FormItem><FormLabel>Local</FormLabel><FormControl><Input {...field} placeholder="Ex: Praça da Sé, Centro, São Paulo" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição Curta</FormLabel><FormControl><Textarea {...field} placeholder="Descreva o que é o evento, principais atrações, etc." /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="startDate" render={({ field }) => (
                                            <FormItem><FormLabel>Início do Evento</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="endDate" render={({ field }) => (
                                            <FormItem><FormLabel>Fim do Evento</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Dicas Táticas para Motoristas</CardTitle>
                                    <CardDescription>Informações geradas pela IA para ajudar os profissionais.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField control={form.control} name="driverSummary" render={({ field }) => (
                                        <FormItem><FormLabel>Resumo Tático</FormLabel><FormControl><Textarea {...field} placeholder="Resumo da oportunidade para o motorista." /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="peakTimes" render={({ field }) => (
                                        <FormItem><FormLabel>Horários de Pico (Chegada e Saída)</FormLabel><FormControl><Input {...field} placeholder="Ex: Chegada: 18h-20h, Saída: 23h-00:30h" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="trafficTips" render={({ field }) => (
                                        <FormItem><FormLabel>Dicas de Trânsito</FormLabel><FormControl><Textarea {...field} placeholder="Ex: Ruas próximas podem estar bloqueadas. Prefira acesso pela Av. XYZ." /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="pickupPoints" render={({ field }) => (
                                        <FormItem><FormLabel>Sugestão de Pontos de Embarque</FormLabel><FormControl><Textarea {...field} placeholder="Ex: Embarque sugerido na Rua ABC, esquina com a Rua 123, para fugir do fluxo." /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Links e Mídia</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                        <FormItem><FormLabel>URL da Imagem de Capa</FormLabel><FormControl><Input {...field} placeholder="https://exemplo.com/imagem.png" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="mapUrl" render={({ field }) => (
                                        <FormItem><FormLabel>URL do Google Maps para o Local</FormLabel><FormControl><Input {...field} placeholder="https://maps.app.goo.gl/..." /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                             <div className="sticky top-20">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview do Card</CardTitle>
                                        <CardDescription>Veja como o evento aparecerá na página inicial.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EventPreviewCard {...watchedValues} />
                                    </CardContent>
                                </Card>
                             </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center mt-4">
                        <Button type="submit" disabled={isSubmitting} size="lg">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Evento
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
