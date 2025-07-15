
'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { partnerFormSchema, type PartnerFormValues } from '@/lib/marketing-schemas';
import { type Partner, type GalleryImage } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, UploadCloud, Link as LinkIcon, Images } from 'lucide-react';
import { createPartner, updatePartner } from '@/app/actions/marketing-actions';
import { getGalleryImages } from '@/app/actions/gallery-actions';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function PartnerForm({ partner }: { partner?: Partner }) {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
        defaultValues: {
            name: partner?.name || '',
            linkUrl: partner?.linkUrl || '',
            size: partner?.size || 'medium',
            isActive: partner?.isActive ?? true,
            imageUrls: partner?.imageUrls || [],
        },
    });

    useEffect(() => {
        getGalleryImages().then(setGalleryImages);
    }, []);

    const watchedImageUrls = useWatch({ control: form.control, name: 'imageUrls' });
    const imagePreview = localPreview || watchedImageUrls?.[0] || '';

    const onSubmit = async (values: PartnerFormValues) => {
        if (!user || !userProfile) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const result = partner
                ? await updatePartner(partner.id, values, user.uid, userProfile.name || 'Admin')
                : await createPartner(values, user.uid, userProfile.name || 'Admin');
            
            if (result.success) {
                toast({ title: partner ? 'Parceiro Atualizado!' : 'Parceiro Criado!', description: `O banner de "${values.name}" foi salvo com sucesso.` });
                router.push('/admin/marketing/partners');
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Banner</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nome do Parceiro</FormLabel><FormControl><Input {...field} placeholder="Ex: Seguradora XPTO" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="linkUrl" render={({ field }) => (
                                    <FormItem><FormLabel>URL de Destino</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormDescription>Para onde o usuário será redirecionado ao clicar no banner.</FormDescription><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="size" render={({ field }) => (
                                    <FormItem><FormLabel>Tamanho do Banner</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="small">Pequeno (Ideal para logos)</SelectItem>
                                                <SelectItem value="medium">Médio (Retangular)</SelectItem>
                                                <SelectItem value="large">Grande (Banner largo)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="isActive" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5"><FormLabel>Banner ativo?</FormLabel><FormDescription>Banners inativos não aparecem no site.</FormDescription></div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8 sticky top-20">
                         <Card>
                            <CardHeader><CardTitle>Imagem do Banner</CardTitle></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="upload">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="upload"><UploadCloud/> Upload</TabsTrigger>
                                        <TabsTrigger value="gallery"><Images/> Galeria</TabsTrigger>
                                        <TabsTrigger value="url"><LinkIcon/> URL</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload" className="pt-4">
                                        <FormField control={form.control} name="imageFile" render={({ field }) => (
                                            <FormItem><FormControl><Input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                field.onChange(file);
                                                if(file) {
                                                    setLocalPreview(URL.createObjectURL(file));
                                                    form.setValue('imageUrls', []); // Clear URLs if file is chosen
                                                } else {
                                                    setLocalPreview(null);
                                                }
                                            }}/></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </TabsContent>
                                     <TabsContent value="gallery" className="pt-4">
                                        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                                        {galleryImages.map(img => (
                                            <button type="button" key={img.id} className={cn("relative aspect-square rounded-md overflow-hidden focus:ring-2 focus:ring-ring ring-offset-2", watchedImageUrls.includes(img.url) && "ring-2 ring-ring")} onClick={() => {
                                                form.setValue('imageUrls', [img.url]);
                                                form.setValue('imageFile', undefined);
                                                setLocalPreview(null);
                                            }}>
                                                <Image src={img.url} alt={img.name} fill className="object-cover"/>
                                            </button>
                                        ))}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="url" className="pt-4">
                                        <FormField control={form.control} name="imageUrls" render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder="https://..." onChange={(e) => {
                                                field.onChange(e);
                                                form.setValue('imageFile', undefined);
                                                setLocalPreview(null);
                                            }}/></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </TabsContent>
                                </Tabs>

                                {imagePreview && (
                                     <div className="mt-4 space-y-2">
                                        <Label>Preview do Banner</Label>
                                        <div className="relative w-full aspect-video rounded-lg border bg-muted p-2 flex items-center justify-center">
                                            <Image src={imagePreview} alt="Preview do Banner" fill className="object-contain"/>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
                            {partner ? 'Salvar Alterações' : 'Salvar Parceiro'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
