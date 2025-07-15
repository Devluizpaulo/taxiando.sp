
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
import { getGalleryImages } from '@/app/actions/gallery-actions';
import { Badge } from '@/components/ui/badge';


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
    const { fields: imageUrls, append, remove } = useFieldArray({
        control: form.control,
        name: "imageUrls"
    });
    
    const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [confirmBonusUpload, setConfirmBonusUpload] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const activeSlotIndex = React.useRef(0);
    
    useEffect(() => {
        if(user) getGalleryImages(user.uid).then(setGalleryImages);
    }, [user, isImageSelectorOpen]);


    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0 || !userProfile) return;
        const file = files[0];
        
        if (activeSlotIndex.current === 3 && (userProfile.credits || 0) < 1) {
            toast({ variant: 'destructive', title: 'Créditos Insuficientes', description: 'Você não tem créditos para adicionar uma imagem bônus.'});
            setConfirmBonusUpload(false);
            return;
        }

        if (activeSlotIndex.current === 3) {
            setConfirmBonusUpload(true);
            return;
        }
        
        // This is where we'd normally call an upload function, but since it's client-side,
        // we'll just add the file to the form state to be handled on submit.
        const imageFiles = form.getValues('imageFiles') || [];
        form.setValue('imageFiles', [...imageFiles, file]);
        // For preview, we use a local URL.
        append({ url: URL.createObjectURL(file) });
        setIsImageSelectorOpen(false);
    }
    
    const confirmUploadAndDeductCredit = async () => {
         if (!fileInputRef.current?.files || !userProfile) return;
         const file = fileInputRef.current.files[0];
         // Here would be the logic to deduct credit, for now we simulate it.
         toast({ title: "Crédito Utilizado!", description: "1 crédito foi deduzido para o upload da imagem bônus." });

         const imageFiles = form.getValues('imageFiles') || [];
         form.setValue('imageFiles', [...imageFiles, file]);
         append({ url: URL.createObjectURL(file) });
         setConfirmBonusUpload(false);
         setIsImageSelectorOpen(false);
    }
    
    const handleGallerySelect = (url: string) => {
        if (imageUrls[activeSlotIndex.current]) {
            form.setValue(`imageUrls.${activeSlotIndex.current}`, { url });
        } else {
            append({ url });
        }
        setIsImageSelectorOpen(false);
    }

    const openImageSelector = (index: number) => {
        activeSlotIndex.current = index;
        setIsImageSelectorOpen(true);
    };

    // Certifique-se que imageUrls é do tipo { url: string }[]
    const safeImageUrls: { url: string }[] = imageUrls.map((img: any) => typeof img.url === 'string' ? img : { url: img.id });

    return (
        <div>
            <Label>Galeria do Anúncio (3 grátis + 1 bônus)</Label>
            <FormDescription>Adicione até 4 imagens para seu serviço. A primeira será a imagem de capa.</FormDescription>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[...Array(4)].map((_, index) => {
                    const imageUrl = safeImageUrls[index]?.url;
                    const isBonusSlot = index === 3;
                    return (
                        <Card key={index} className={cn("aspect-video flex items-center justify-center relative group", isBonusSlot && "border-dashed border-primary")}>
                            {imageUrl ? (
                                <>
                                    <Image src={imageUrl} alt={`Imagem do serviço ${index + 1}`} fill className="object-cover rounded-md" />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 z-10" onClick={() => remove(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Button type="button" variant="ghost" onClick={() => openImageSelector(index)} className="h-auto p-2 flex flex-col items-center">
                                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground mt-1">{isBonusSlot ? "Slot Bônus" : `Imagem ${index + 1}`}</span>
                                    </Button>
                                </div>
                            )}
                             {isBonusSlot && <Badge variant="secondary" className="absolute bottom-1 right-1 bg-amber-200 text-amber-800"><Coins className="mr-1 h-3 w-3"/> Bônus</Badge>}
                        </Card>
                    );
                })}
            </div>

            <AlertDialog open={isImageSelectorOpen} onOpenChange={setIsImageSelectorOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Selecionar Imagem</AlertDialogTitle></AlertDialogHeader>
                    <Tabs defaultValue="upload">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload"><UploadCloud className="mr-2"/>Novo Upload</TabsTrigger>
                            <TabsTrigger value="gallery"><Images className="mr-2"/>Minha Galeria</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="pt-4">
                            <Input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} />
                        </TabsContent>
                        <TabsContent value="gallery" className="pt-4">
                            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                                {galleryImages.length > 0 ? galleryImages.map(img => (
                                    <button type="button" key={img.id} className="relative aspect-square rounded-md overflow-hidden" onClick={() => handleGallerySelect(img.url)}>
                                        <Image src={img.url} alt={img.name} fill className="object-cover"/>
                                    </button>
                                )) : <p className="col-span-full text-center text-sm text-muted-foreground py-8">Sua galeria está vazia.</p>}
                            </div>
                        </TabsContent>
                    </Tabs>
                </AlertDialogContent>
            </AlertDialog>

             <AlertDialog open={confirmBonusUpload} onOpenChange={setConfirmBonusUpload}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Upload Bônus</AlertDialogTitle><AlertDialogDescription>Este é um slot de imagem bônus. Um novo upload aqui consumirá 1 crédito do seu saldo. Deseja continuar?</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmUploadAndDeductCredit}>Sim, usar 1 crédito</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

