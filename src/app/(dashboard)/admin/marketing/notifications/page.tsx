
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { sendNotification } from '@/app/actions/marketing-actions';


const notificationSchema = z.object({
  title: z.string().min(5, "O título é obrigatório."),
  message: z.string().min(10, "A mensagem é obrigatória."),
  targetAudience: z.enum(['all', 'drivers', 'fleets', 'providers', 'admins'], { required_error: "Selecione o público."}),
  icon: z.string().optional(),
  link: z.string().url("URL inválida.").optional().or(z.literal('')),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function SendNotificationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title: '',
            message: '',
            targetAudience: 'all',
            icon: '',
            link: '',
        },
    });

    const onSubmit = async (values: NotificationFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await sendNotification(values);
            if (result.success) {
                toast({
                    title: 'Notificação Enviada!',
                    description: 'A notificação foi enviada para o público selecionado.',
                });
                form.reset();
            } else {
                 toast({ variant: 'destructive', title: 'Erro ao Enviar', description: result.error });
            }
        } catch (error) {
            console.error("Error sending notification: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro Crítico',
                description: 'Não foi possível se comunicar com o servidor. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Enviar Notificação</h1>
                    <p className="text-muted-foreground">Comunique novidades, promoções ou avisos para seus usuários.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Conteúdo da Notificação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="Ex: Novo Curso Disponível!" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem><FormLabel>Mensagem</FormLabel><FormControl><Textarea {...field} placeholder="Descreva a novidade aqui." /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="targetAudience" render={({ field }) => (
                            <FormItem><FormLabel>Público-Alvo</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Usuários</SelectItem>
                                        <SelectItem value="drivers">Apenas Motoristas</SelectItem>
                                        <SelectItem value="fleets">Apenas Frotas</SelectItem>
                                        <SelectItem value="providers">Apenas Prestadores</SelectItem>
                                        <SelectItem value="admins">Apenas Administradores</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="icon" render={({ field }) => (
                                <FormItem><FormLabel>Ícone (Opcional)</FormLabel><FormControl><Input {...field} placeholder="Ex: 'gift' ou 'award'" /></FormControl><FormDescription>Nome de um ícone da biblioteca <a href="https://lucide.dev/icons/" target="_blank" className="underline">Lucide</a>.</FormDescription><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="link" render={({ field }) => (
                                <FormItem><FormLabel>Link (Opcional)</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormDescription>Um link para direcionar o usuário ao clicar.</FormDescription><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Notificação
                    </Button>
                </div>
            </form>
        </Form>
    );
}
