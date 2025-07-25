
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import { createEvent } from '@/app/actions/event-actions';
import { planEvent, type EventPlannerOutput } from '@/ai/flows/event-planner-flow';
import { EventCard } from '@/components/event-card';
import { toDate } from '@/lib/date-utils';


const eventFormSchema = z.object({
    title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
    description: z.string().min(20, { message: "A descrição deve ter pelo menos 20 caracteres." }),
    location: z.string().min(3, { message: "O local é obrigatório." }),
    startDate: z.date({ required_error: "A data e hora de início são obrigatórias." }),
    driverSummary: z.string().min(5, { message: "O resumo tático é obrigatório." }),
    peakTimes: z.string().min(5, { message: "A dica de horários de pico é obrigatória." }),
    trafficTips: z.string().min(5, { message: "A dica de trânsito é obrigatória." }),
    pickupPoints: z.string().min(5, { message: "A sugestão de pontos de embarque é obrigatória." }),
    mapUrl: z.string().url("A URL do mapa precisa ser um link válido.").min(1, "A URL do mapa é obrigatória."),
});


type EventFormValues = z.infer<typeof eventFormSchema>;

const AiAssistantCard = ({ onDetailsGenerated, isGenerating }: { onDetailsGenerated: (details: EventPlannerOutput) => void, isGenerating: boolean }) => {
    const [eventQuery, setEventQuery] = useState('');
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (eventQuery.trim().length < 10) {
            toast({ variant: 'destructive', title: 'Consulta muito curta', description: 'Por favor, forneça mais detalhes sobre o evento.' });
            return;
        }

        try {
            const result = await planEvent({ eventQuery });
            onDetailsGenerated(result);
            toast({ title: "Detalhes Gerados!", description: "O formulário foi preenchido com as informações da IA." });
        } catch (error) {
            console.error("AI generation error:", error);
            toast({ variant: 'destructive', title: 'Erro da IA', description: 'Não foi possível gerar os detalhes do evento.' });
        }
    };

    return (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Assistente de IA</CardTitle>
                <CardDescription>Não quer preencher tudo manualmente? Descreva o evento e deixe a IA fazer o trabalho pesado.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Textarea
                        placeholder="Ex: Show da Ivete Sangalo no Anhembi, 20 mil pessoas, começa 22h, dia 15/12"
                        value={eventQuery}
                        onChange={(e) => setEventQuery(e.target.value)}
                        rows={3}
                    />
                    <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Gerar Detalhes com IA
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CreateEventPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            description: '',
            location: '',
            startDate: new Date(),
            driverSummary: '',
            peakTimes: '',
            trafficTips: '',
            pickupPoints: '',
            mapUrl: '',
        },
    });

    const watchedValues = form.watch();

    const handleDetailsGenerated = (details: EventPlannerOutput) => {
        form.setValue('title', details.title);
        form.setValue('description', details.description);
        form.setValue('location', details.location);
        form.setValue('driverSummary', details.driverSummary);
        form.setValue('peakTimes', details.peakTimes);
        form.setValue('trafficTips', details.trafficTips);
        form.setValue('pickupPoints', details.pickupPoints);
        form.setValue('mapUrl', details.mapUrl);
        setIsGenerating(false);
    }
    
     const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value; // "HH:mm"
        if (!time) return;
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = toDate(watchedValues.startDate);
        if (newDate instanceof Date) {
            newDate.setHours(hours, minutes);
            form.setValue('startDate', newDate, { shouldValidate: true, shouldDirty: true });
        }
    };

    const handleDateChange = (date?: Date) => {
        if (!date) return;
        const currentStartDate = watchedValues.startDate || new Date();
        const hours = currentStartDate.getHours();
        const minutes = currentStartDate.getMinutes();
        const newDate = new Date(date);
        newDate.setHours(hours, minutes);
        form.setValue('startDate', newDate, { shouldValidate: true, shouldDirty: true });
    };

    const onSubmit = async (values: EventFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createEvent(values);

            if (result.success) {
                toast({
                    title: 'Evento Criado com Sucesso!',
                    description: `O evento "${values.title}" foi salvo e já está visível.`,
                });
                router.push('/admin/events');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error creating event: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Criar Evento',
                description: (error as Error).message || 'Não foi possível salvar o evento. Verifique o console para mais detalhes.',
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
                        <p className="text-muted-foreground">Preencha os campos para criar um novo evento na agenda.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            <AiAssistantCard onDetailsGenerated={handleDetailsGenerated} isGenerating={isGenerating} />
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações do Evento</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem><FormLabel>Título do Evento</FormLabel><FormControl><Input {...field} placeholder="Ex: Virada Cultural Paulista" /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="location" render={({ field }) => (
                                        <FormItem><FormLabel>Local</FormLabel><FormControl><Input {...field} placeholder="Ex: Praça da Sé, Centro, São Paulo" /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Descrição Curta</FormLabel><FormControl><Textarea {...field} placeholder="Descreva o que é o evento, principais atrações, etc." /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormItem>
                                            <FormLabel>Data do Evento</FormLabel>
                                            <DatePicker value={watchedValues.startDate} onChange={handleDateChange} />
                                            <FormMessage />
                                        </FormItem>
                                        <FormItem>
                                            <FormLabel>Horário de Início</FormLabel>
                                            <Input type="time" value={format(watchedValues.startDate, 'HH:mm')} onChange={handleTimeChange} />
                                            <FormMessage />
                                        </FormItem>
                                    </div>
                                    <FormField control={form.control} name="mapUrl" render={({ field }) => (
                                        <FormItem><FormLabel>URL do Google Maps para o Local</FormLabel><FormControl><Input {...field} placeholder="https://maps.app.goo.gl/..." /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Dicas Táticas para Motoristas</CardTitle>
                                    <CardDescription>Informações para ajudar os profissionais.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField control={form.control} name="driverSummary" render={({ field }) => (
                                        <FormItem><FormLabel>Resumo Tático</FormLabel><FormControl><Textarea {...field} placeholder="Resumo da oportunidade para o motorista." /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="peakTimes" render={({ field }) => (
                                        <FormItem><FormLabel>Horários de Pico (Chegada e Saída)</FormLabel><FormControl><Input {...field} placeholder="Ex: Chegada: 18h-20h, Saída: 23h-00:30h" /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="trafficTips" render={({ field }) => (
                                        <FormItem><FormLabel>Dicas de Trânsito</FormLabel><FormControl><Textarea {...field} placeholder="Ex: Ruas próximas podem estar bloqueadas. Prefira acesso pela Av. XYZ." /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="pickupPoints" render={({ field }) => (
                                        <FormItem><FormLabel>Sugestão de Pontos de Embarque</FormLabel><FormControl><Textarea {...field} placeholder="Ex: Embarque sugerido na Rua ABC, esquina com a Rua 123, para fugir do fluxo." /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="sticky top-20">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview do Banner</CardTitle>
                                        <CardDescription>Veja como o evento aparecerá na página inicial.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EventCard event={{...watchedValues, id: 'preview', createdAt: new Date().toISOString(), startDate: watchedValues.startDate instanceof Date ? watchedValues.startDate.toISOString() : watchedValues.startDate}} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center mt-4">
                        <Button type="submit" disabled={isSubmitting || isGenerating} size="lg">
                            {(isSubmitting || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Evento
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
