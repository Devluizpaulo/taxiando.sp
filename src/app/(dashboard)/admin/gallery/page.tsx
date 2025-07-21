
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { getGalleryImages, deleteGalleryImage, updateGalleryImage } from '@/app/actions/gallery-actions';
import { uploadBlogImages } from '@/app/actions/secure-storage-actions';
import { useAuth } from '@/hooks/use-auth';
import { type GalleryImage } from '@/lib/types';

import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Upload, Loader2, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const imageFormSchema = z.object({
  name: z.string().min(3, "O nome da imagem é obrigatório."),
  category: z.string().min(3, "A categoria é obrigatória."),
  isPublic: z.boolean().default(false),
});

type ImageFormValues = z.infer<typeof imageFormSchema>;

function ImageUploadDialog({ onUploadFinished }: { onUploadFinished: () => void }) {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const form = useForm<ImageFormValues>({ resolver: zodResolver(imageFormSchema), defaultValues: { name: '', category: 'Geral', isPublic: true }});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            if (!form.getValues('name')) {
                form.setValue('name', selectedFile.name.split('.').slice(0, -1).join('.'));
            }
        }
    };

    const onSubmit = async (values: ImageFormValues) => {
        if (!file || !user || !userProfile) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Arquivo ou usuário não encontrado.' });
            return;
        }
        setIsUploading(true);
        try {
            const uploadResult = await uploadBlogImages([file], user.uid, userProfile.name || 'Admin', true);
            
            if (uploadResult.length > 0 && uploadResult[0].success && uploadResult[0].url) {
                toast({ title: 'Upload Concluído!', description: 'Sua imagem foi adicionada à galeria.' });
                onUploadFinished();
            } else {
                throw new Error(uploadResult[0]?.error || 'Falha no upload do arquivo.');
            }

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro no Upload', description: (error as Error).message });
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <Dialog onOpenChange={(open) => !open && (setFile(null), setPreview(null), form.reset())}>
            <DialogTrigger asChild>
                <Button><PlusCircle /> Fazer Upload</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fazer Upload para a Galeria</DialogTitle>
                    <DialogDescription>A imagem ficará disponível para uso em todo o site.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Input type="file" accept="image/*" onChange={handleFileChange} required/>
                        {preview && <Image src={preview} alt="Preview" width={200} height={200} className="w-full h-auto rounded-md object-cover" />}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome da Imagem</FormLabel><FormControl><Input {...field} placeholder="Ex: Motorista sorrindo" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} placeholder="Ex: Eventos, Blog, Veículos" /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="isPublic" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div><FormLabel>Imagem Pública?</FormLabel><FormDescription>Disponível para todos os usuários.</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                         )}/>
                         <DialogFooter>
                             <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                             <Button type="submit" disabled={isUploading}>
                                 {isUploading && <Loader2 className="mr-2 animate-spin"/>} Upload
                             </Button>
                         </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function GalleryAdminPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
    const { toast } = useToast();

    const fetchImages = async () => {
        setLoading(true);
        const data = await getGalleryImages();
        setImages(data);
        setLoading(false);
    }
    
    useEffect(() => {
        fetchImages();
    }, []);

    const handleDelete = async () => {
        if (!imageToDelete) return;
        const result = await deleteGalleryImage(imageToDelete.id);
        if (result.success) {
            toast({ title: 'Imagem Removida!' });
            fetchImages();
        } else {
            toast({ variant: 'destructive', title: 'Erro ao remover', description: result.error });
        }
        setImageToDelete(null);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    const publicImages = images.filter(img => img.isPublic);
    const privateImages = images.filter(img => !img.isPublic);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Galeria de Mídia</h1>
                <p className="text-muted-foreground">Gerencie todas as imagens da plataforma.</p>
            </div>
            
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle>Imagens da Galeria</CardTitle>
                        <CardDescription>Faça upload de novas imagens ou gerencie as existentes.</CardDescription>
                    </div>
                    <ImageUploadDialog onUploadFinished={fetchImages} />
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="public">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="public">Públicas</TabsTrigger>
                            <TabsTrigger value="private">Privadas de Usuários</TabsTrigger>
                        </TabsList>
                        <TabsContent value="public" className="pt-4">
                           <ImageGrid images={publicImages} onDeleteClick={setImageToDelete} onUpdate={fetchImages}/>
                        </TabsContent>
                         <TabsContent value="private" className="pt-4">
                           <ImageGrid images={privateImages} onDeleteClick={setImageToDelete} onUpdate={fetchImages}/>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

             <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação removerá a imagem permanentemente da galeria e do armazenamento. Links existentes para esta imagem deixarão de funcionar.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Sim, remover</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ImageGrid({ images, onDeleteClick, onUpdate }: { images: GalleryImage[], onDeleteClick: (img: GalleryImage) => void, onUpdate: () => void }) {
     if (images.length === 0) {
        return <div className="text-center text-muted-foreground py-16">Nenhuma imagem nesta categoria.</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map(img => (
                <Card key={img.id} className="group relative overflow-hidden">
                    <Image src={img.url} alt={img.name} width={300} height={300} className="w-full h-40 object-cover" />
                    <div className="p-2 text-sm">
                        <p className="font-semibold truncate" title={img.name}>{img.name}</p>
                        <p className="text-xs text-muted-foreground">Categoria: {img.category}</p>
                        <p className="text-xs text-muted-foreground truncate" title={img.ownerName}>Por: {img.ownerName}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <EditImageDialog image={img} onUpdate={onUpdate} />
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => onDeleteClick(img)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}


function EditImageDialog({ image, onUpdate }: { image: GalleryImage, onUpdate: () => void }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<ImageFormValues>({
        resolver: zodResolver(imageFormSchema),
        defaultValues: { name: image.name, category: image.category, isPublic: image.isPublic }
    });
     const [isOpen, setIsOpen] = useState(false);

    const onSubmit = async (values: ImageFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await updateGalleryImage(image.id, values);
            if(result.success) {
                toast({ title: "Imagem atualizada!" });
                onUpdate();
                setIsOpen(false);
            } else {
                throw new Error(result.error);
            }
        } catch(e) {
            toast({ variant: 'destructive', title: 'Erro', description: (e as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="icon" className="h-7 w-7"><Edit className="h-4 w-4"/></Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Editar Imagem</DialogTitle>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <Image src={image.url} alt={image.name} width={200} height={200} className="w-full h-auto rounded-md object-cover" />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome da Imagem</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="isPublic" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div><FormLabel>Imagem Pública?</FormLabel></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                         )}/>
                         <DialogFooter>
                             <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                             <Button type="submit" disabled={isSubmitting}>
                                 {isSubmitting && <Loader2 className="mr-2 animate-spin"/>} Salvar
                             </Button>
                         </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
