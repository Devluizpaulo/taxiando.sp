'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
// import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { useAuth } from '@/hooks/use-auth';
// import { nanoid } from 'nanoid';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const serviceFormSchema = z.object({
  title: z.string().min(10, "O título deve ter pelo menos 10 caracteres."),
  category: z.string().min(3, "A categoria é obrigatória."),
  description: z.string().min(30, "A descrição deve ter pelo menos 30 caracteres."),
  price: z.string().min(1, "O preço ou forma de consulta é obrigatório."),
  imageUrl: z.string().url("URL da imagem inválida.").optional().or(z.literal('')),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function CreateServicePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const { user } = useAuth();

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            title: '',
            category: '',
            description: '',
            price: '',
            imageUrl: '',
        },
    });

    const onSubmit = async (values: ServiceFormValues) => {
        setIsSubmitting(true);
        // if (!user) {
        //     toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
        //     setIsSubmitting(false);
        //     return;
        // }
        try {
            // const serviceId = nanoid();
            // const serviceData = {
            //     id: serviceId,
            //     providerId: user.uid,
            //     ...values,
            //     status: 'pending_review',
            //     createdAt: serverTimestamp(),
            // };
            
            // await setDoc(doc(db, 'services', serviceId), serviceData);

            toast({
                title: 'Anúncio Enviado para Análise!',
                description: 'Seu anúncio foi criado e será revisado pela nossa equipe em breve.',
            });
            router.push('/services');

        } catch (error) {
            console.error("Error creating service: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Criar Anúncio',
                description: 'Não foi possível salvar seu anúncio. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Criar Novo Anúncio</h1>
                    <p className="text-muted-foreground">Descreva o serviço ou produto que você oferece para a comunidade.</p>
                </div>

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
                                <FormItem><FormLabel>URL da Imagem de Capa</FormLabel><FormControl><Input {...field} placeholder="https://exemplo.com/imagem.png" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Anúncio
                    </Button>
                </div>
            </form>
        </Form>
    );
}
