
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { createService, updateService } from '@/app/actions/service-actions';
import { serviceFormSchema, type ServiceFormValues } from '@/lib/service-schemas';
import { type ServiceListing } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function ServiceForm({ service }: { service?: ServiceListing }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, userProfile } = useAuth();
    
    const isEditMode = !!service;

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: isEditMode ? {
            title: service.title,
            category: service.category,
            description: service.description,
            price: service.price,
            imageUrl: service.imageUrl || '',
        } : {
            title: '',
            category: '',
            description: '',
            price: '',
            imageUrl: '',
        },
    });

    const onSubmit = async (values: ServiceFormValues) => {
        setIsSubmitting(true);
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const result = isEditMode
                ? await updateService(service.id, values)
                : await createService(values, user.uid, userProfile.nomeFantasia || userProfile.name || 'Prestador Anônimo');

            if (result.success) {
                toast({
                    title: isEditMode ? 'Anúncio Atualizado!' : 'Anúncio Criado!',
                    description: 'Seu anúncio foi enviado para análise pela nossa equipe.',
                });
                router.push('/services');
                router.refresh();
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar Anúncio',
                description: (error as Error).message || 'Não foi possível salvar seu anúncio.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Anúncio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Título do Anúncio</FormLabel><FormControl><Input {...field} placeholder="Ex: Instalação de Película Automotiva Profissional" /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} placeholder="Ex: Oficina Mecânica, Acessórios, Despachante" /></FormControl><FormDescription>Em qual categoria seu serviço se encaixa melhor?</FormDescription><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descrição Completa</FormLabel><FormControl><Textarea {...field} placeholder="Detalhe o que está incluso no serviço, seus diferenciais, materiais utilizados, etc." rows={6} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><FormLabel>Preço</FormLabel><FormControl><Input {...field} placeholder="R$ 150,00 ou 'Sob Consulta'" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem><FormLabel>URL da Imagem de Capa (Opcional)</FormLabel><FormControl><Input {...field} placeholder="https://exemplo.com/imagem.png" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditMode ? 'Salvar Alterações' : 'Salvar e Enviar para Análise'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
