
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import { createService, updateService } from '@/app/actions/service-actions';
import { serviceFormSchema, type ServiceFormValues } from '@/lib/service-schemas';
import { type ServiceListing, type GalleryImage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ImagePlus, X, Coins, UploadCloud, Images } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FirebaseImageUpload } from '@/components/ui/firebase-image-upload';


export function ServiceForm({ service }: { service?: ServiceListing }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, userProfile } = useAuth();
    
    const isEditMode = !!service;

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: isEditMode ? {
            ...service,
            imageUrls: service.imageUrls.map(url => ({ url })),
        } : {
            title: '',
            category: '',
            description: '',
            price: '',
            imageUrls: [],
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
                        </div>
                        <div className="pt-4 border-t">
                            <ImageGalleryManager form={form} />
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

function ImageGalleryManager({ form }: { form: any }) {
    // Usa o novo FirebaseImageUpload para até 4 imagens
    const imageUrls = form.watch('imageUrls') || [];
    const setImageUrl = (index: number, url: string) => {
        const arr = [...imageUrls];
        arr[index] = { url };
        form.setValue('imageUrls', arr);
    };
    return (
        <div>
            <Label>Galeria do Anúncio (3 grátis + 1 bônus)</Label>
            <FormDescription>Adicione até 4 imagens para seu serviço. A primeira será a imagem de capa.</FormDescription>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[...Array(4)].map((_, index) => {
                    const imageUrl = imageUrls[index]?.url;
                    const isBonusSlot = index === 3;
                    return (
                        <Card key={index} className={cn("aspect-video flex items-center justify-center relative group", isBonusSlot && "border-dashed border-primary")}> 
                            <div className="flex flex-col items-center w-full">
                                <FirebaseImageUpload
                                    value={imageUrl}
                                    onChange={url => setImageUrl(index, url)}
                                    pathPrefix={`services/gallery/`}
                                    label={isBonusSlot ? "Slot Bônus" : `Imagem ${index + 1}`}
                                />
                                {isBonusSlot && <Badge variant="secondary" className="absolute bottom-1 right-1 bg-amber-200 text-amber-800"><Coins className="mr-1 h-3 w-3"/> Bônus</Badge>}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

