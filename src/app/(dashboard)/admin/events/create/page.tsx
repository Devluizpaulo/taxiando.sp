
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { nanoid } from 'nanoid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';


const eventFormSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  description: z.string().min(20, { message: "A descrição deve ter pelo menos 20 caracteres." }),
  location: z.string().min(3, { message: "O local é obrigatório." }),
  imageUrl: z.string().url("URL da imagem inválida.").min(1, "A URL da imagem é obrigatória."),
  startDate: z.date({ required_error: "A data de início é obrigatória." }),
  endDate: z.date({ required_error: "A data de término é obrigatória." }),
  bestTime: z.string().min(5, { message: "A dica de melhor horário é obrigatória." }),
  trafficTips: z.string().min(5, { message: "A dica de trânsito é obrigatória." }),
  mapUrl: z.string().url("URL do mapa inválida.").min(1, "A URL do mapa é obrigatória."),
}).refine(data => data.endDate > data.startDate, {
  message: "A data de término deve ser posterior à data de início.",
  path: ["endDate"],
});


type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CreateEventPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            description: '',
            location: '',
            imageUrl: '',
            bestTime: '',
            trafficTips: '',
            mapUrl: '',
        },
    });

    const onSubmit = async (values: EventFormValues) => {
        setIsSubmitting(true);
        try {
            const eventId = nanoid();
            const eventData = {
                id: eventId,
                ...values,
                startDate: Timestamp.fromDate(values.startDate),
                endDate: Timestamp.fromDate(values.endDate),
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
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Criador de Eventos</h1>
                    <p className="text-muted-foreground">Adicione um novo evento à Agenda Cultural da cidade.</p>
                </div>

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
                        <CardTitle>Dicas para Motoristas</CardTitle>
                        <CardDescription>Informações úteis para ajudar os profissionais a se planejarem.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-6">
                         <FormField control={form.control} name="bestTime" render={({ field }) => (
                            <FormItem><FormLabel>Melhor Horário para Atendimento</FormLabel><FormControl><Input {...field} placeholder="Ex: Picos de movimento são na abertura e no encerramento." /></FormControl><FormMessage /></FormItem>
                        )}/>
                          <FormField control={form.control} name="trafficTips" render={({ field }) => (
                            <FormItem><FormLabel>Dicas de Trânsito</FormLabel><FormControl><Textarea {...field} placeholder="Ex: Ruas próximas como a Rua Direita estarão bloqueadas. Prefira o acesso pela Av. Rangel Pestana." /></FormControl><FormMessage /></FormItem>
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

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Evento
                    </Button>
                </div>
            </form>
        </Form>
    );
}
