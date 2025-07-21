
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth, useAuthProtection } from '@/hooks/use-auth';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Instagram, MessageSquare, Search, Camera, PlusCircle, Trash2, ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { fleetAmenities } from '@/lib/data';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { LoadingScreen } from '@/components/loading-screen';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { uploadFleetLogoFile, uploadFleetGalleryFiles } from '@/app/actions/storage-actions-compat';
import Image from 'next/image';

const fleetProfileSchema = z.object({
  photoUrl: z.string().optional(),
  logoFile: z.any().optional(),
  companyDescription: z.string().min(20, "A descrição deve ter no mínimo 20 caracteres.").max(500, "A descrição deve ter no máximo 500 caracteres."),
  zipCode: z.string().min(8, "O CEP deve ter 8 dígitos."),
  address: z.string().min(3, "A rua é obrigatória."),
  addressNumber: z.string().min(1, "O número é obrigatório."),
  addressComplement: z.string().optional(),
  neighborhood: z.string().min(3, "O bairro é obrigatório."),
  city: z.string().min(3, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório.").max(2),
  contactPhone: z.string().min(10, "O telefone é obrigatório."),
  contactEmail: z.string().email("Email de contato inválido."),
  socialMedia: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    whatsapp: z.string().optional(),
  }),
  amenities: z.array(z.string()).optional(),
  otherAmenities: z.string().optional(),
  galleryImages: z.array(z.object({ url: z.string() })).default([]),
  newGalleryFiles: z.any().optional(),
});

type FleetProfileValues = z.infer<typeof fleetProfileSchema>;

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Canvas context not available'));
    }

    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) reject(new Error('Canvas is empty'));
            else resolve(blob);
        }, 'image/png', 1);
    });
}


export default function FleetProfilePage() {
    const { user, userProfile, loading } = useAuthProtection({ requiredRoles: ['fleet', 'admin'] });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    // Image Cropping State
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

    const form = useForm<FleetProfileValues>({
        resolver: zodResolver(fleetProfileSchema),
        defaultValues: {
            companyDescription: '', zipCode: '', address: '', addressNumber: '', addressComplement: '',
            neighborhood: '', city: '', state: 'SP', contactPhone: '', contactEmail: '',
            socialMedia: { instagram: '', facebook: '', whatsapp: '' },
            amenities: [], otherAmenities: '', galleryImages: [],
        },
    });
    
    const { fields: galleryFields, append: appendGalleryImage, remove: removeGalleryImage } = useFieldArray({
        control: form.control,
        name: "galleryImages",
    });


    useEffect(() => {
        if (!loading && userProfile) {
            form.reset({
                photoUrl: userProfile.photoUrl || '',
                companyDescription: userProfile.companyDescription || '',
                zipCode: userProfile.zipCode || '', address: userProfile.address || '',
                addressNumber: userProfile.addressNumber || '', addressComplement: userProfile.addressComplement || '',
                neighborhood: userProfile.neighborhood || '', city: userProfile.city || '',
                state: userProfile.state || 'SP', contactPhone: userProfile.phone || '',
                contactEmail: userProfile.email || '',
                socialMedia: userProfile.socialMedia || { instagram: '', facebook: '', whatsapp: '' },
                amenities: userProfile.amenities?.map(a => a.id) || [],
                otherAmenities: userProfile.otherAmenities || '',
                galleryImages: userProfile.galleryImages?.map(img => ({url: img.url})) || [],
            });
            setLogoPreviewUrl(userProfile.photoUrl || null);
        }
    }, [userProfile, loading, form]);

    const handleCepSearch = async () => {
        const cep = form.getValues('zipCode').replace(/\D/g, '');
        if (cep.length !== 8) {
            toast({ variant: 'destructive', title: 'CEP Inválido', description: 'Por favor, digite um CEP com 8 dígitos.' });
            return;
        }

        setIsFetchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) throw new Error('CEP não encontrado.');
            const data = await response.json();
            if (data.erro) throw new Error('CEP não encontrado.');
            form.setValue('address', data.logradouro, { shouldValidate: true });
            form.setValue('neighborhood', data.bairro, { shouldValidate: true });
            form.setValue('city', data.localidade, { shouldValidate: true });
            form.setValue('state', data.uf, { shouldValidate: true });
            form.setFocus('addressNumber');
            toast({ title: 'Endereço encontrado!', description: 'Complete com o número e complemento.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar CEP', description: (error as Error).message });
        } finally {
            setIsFetchingCep(false);
        }
    };
    
    const onSelectLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setIsCropModalOpen(true);
            e.target.value = '';
        }
    };
    
    const handleCropImage = async () => {
        if (!completedCrop || !imgRef.current) return;
        const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
        const croppedFile = new File([croppedBlob], `logo_${user?.uid}.png`, { type: 'image/png' });
        if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(URL.createObjectURL(croppedFile));
        form.setValue('logoFile', croppedFile, { shouldValidate: true, shouldDirty: true });
        setIsCropModalOpen(false);
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && user && userProfile) {
            const files = Array.from(e.target.files);
            toast({ title: `Fazendo upload de ${files.length} imagens...`, description: "Aguarde um momento." });
            
            const uploadResult = await uploadFleetGalleryFiles(files, user.uid, userProfile.name || 'Frota');
            if(uploadResult.success && uploadResult.urls) {
                uploadResult.urls.forEach(url => {
                    appendGalleryImage({ url });
                });
                toast({ title: 'Upload Concluído!' });
            } else {
                toast({ variant: 'destructive', title: 'Falha no Upload', description: uploadResult.error || 'Não foi possível enviar as imagens.' });
            }
        }
    }


     if (loading || !userProfile) {
        return <LoadingScreen />;
    }

    const onSubmit = async (values: FleetProfileValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            let finalLogoUrl = values.photoUrl;
            if (values.logoFile) {
                toast({ title: "Fazendo upload do logo...", description: "Aguarde um momento." });
                const formData = new FormData();
                formData.append('file', values.logoFile);
                const uploadResult = await uploadFleetLogoFile(formData, user.uid, userProfile.name || 'Frota');
                if (uploadResult.success && uploadResult.url) {
                    finalLogoUrl = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error || 'Falha no upload do logo.');
                }
            }

            const userDocRef = doc(db, 'users', user.uid);
            
            const amenitiesToSave = values.amenities?.map(amenityId => fleetAmenities.find(a => a.id === amenityId)!).filter(Boolean) || [];
            
            await updateDoc(userDocRef, {
                photoUrl: finalLogoUrl,
                companyDescription: values.companyDescription,
                zipCode: values.zipCode,
                address: values.address,
                addressNumber: values.addressNumber,
                addressComplement: values.addressComplement,
                neighborhood: values.neighborhood,
                city: values.city,
                state: values.state,
                phone: values.contactPhone,
                email: values.contactEmail,
                socialMedia: values.socialMedia,
                amenities: amenitiesToSave,
                otherAmenities: values.otherAmenities,
                galleryImages: values.galleryImages,
            });

            toast({ title: 'Perfil da Frota Atualizado!', description: 'As informações da sua frota foram salvas com sucesso.' });
        } catch (error) {
            console.error("Error updating fleet profile: ", error);
            toast({ variant: 'destructive', title: 'Erro ao atualizar', description: 'Não foi possível salvar os dados da sua frota. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Perfil da Frota</h1>
                <p className="text-muted-foreground">Construa um perfil atraente para se destacar para os melhores motoristas.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Identidade Visual</CardTitle>
                            <CardDescription>O logo é a cara da sua empresa. Uma galeria de fotos mostra a qualidade da sua estrutura.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <FormItem>
                                <FormLabel>Logo da Empresa</FormLabel>
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24 border">
                                        <AvatarImage src={logoPreviewUrl || undefined} />
                                        <AvatarFallback><Camera className="h-8 w-8 text-muted-foreground"/></AvatarFallback>
                                    </Avatar>
                                    <FormControl>
                                        <Input type="file" accept="image/*" className="max-w-xs" onChange={onSelectLogoFile} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                            <div className="space-y-2">
                                <FormLabel>Galeria de Fotos</FormLabel>
                                <FormDescription>Mostre sua garagem, escritório, ou os melhores carros da frota. Boas fotos atraem bons motoristas!</FormDescription>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {galleryFields.map((field, index) => (
                                        <div key={field.id} className="relative group aspect-square">
                                            <Image src={field.url} alt={`Imagem da galeria ${index + 1}`} fill className="object-cover rounded-md" />
                                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeGalleryImage(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Label htmlFor="gallery-upload" className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground"/>
                                        <span className="text-xs text-muted-foreground mt-2">Adicionar</span>
                                    </Label>
                                    <Input id="gallery-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>Informações da Empresa</CardTitle>
                            <CardDescription>Apresente sua frota para os motoristas. Uma boa descrição gera mais confiança.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField control={form.control} name="companyDescription" render={({ field }) => (
                                <FormItem><FormLabel>Descrição da Frota</FormLabel><FormControl><Textarea placeholder="Fale sobre a sua frota, seus valores, diferenciais e o que você busca em um motorista parceiro." {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormItem>
                                <FormLabel>Endereço da Garagem/Sede</FormLabel>
                                <div className="space-y-4 rounded-lg border p-4">
                                     <div className="flex items-end gap-2">
                                        <FormField control={form.control} name="zipCode" render={({ field }) => (
                                            <FormItem className="w-full max-w-xs"><FormLabel>CEP</FormLabel><FormControl><Input placeholder="00000-000" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <Button type="button" variant="outline" onClick={handleCepSearch} disabled={isFetchingCep}>
                                            {isFetchingCep ? <Loader2 className="animate-spin" /> : <Search />} Buscar
                                        </Button>
                                    </div>
                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem><FormLabel>Rua / Logradouro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField control={form.control} name="addressNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="addressComplement" render={({ field }) => (
                                            <FormItem className="md:col-span-2"><FormLabel>Complemento (Opcional)</FormLabel><FormControl><Input placeholder="Apto, Bloco, etc." {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                         <FormField control={form.control} name="neighborhood" render={({ field }) => (
                                            <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="state" render={({ field }) => (
                                            <FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} maxLength={2} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                </div>
                            </FormItem>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Comodidades e Diferenciais</CardTitle>
                            <CardDescription>Marque os benefícios que sua frota oferece aos motoristas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="amenities"
                                render={() => (
                                    <FormItem className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                    {fleetAmenities.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="amenities"
                                        render={({ field }) => (
                                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), item.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.id
                                                        )
                                                    )
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                            </FormItem>
                                        )}
                                        />
                                    ))}
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <FormField control={form.control} name="otherAmenities" render={({ field }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Outros Benefícios</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Ex: Convênio com posto de gasolina, bonificação por desempenho, etc." {...field} />
                                    </FormControl>
                                    <FormDescription>Liste aqui outras vantagens não mencionadas acima.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                             <CardTitle>Informações de Contato</CardTitle>
                             <CardDescription>Como os motoristas podem entrar em contato com sua empresa.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Telefone Principal</FormLabel><FormControl><Input {...field} placeholder="(11) 9..." /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                    <FormItem><FormLabel>Email Principal</FormLabel><FormControl><Input {...field} placeholder="contato@suafrota.com" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="space-y-4">
                                <Label>Redes Sociais (Opcional)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="socialMedia.instagram" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><Instagram/> Instagram</FormLabel><FormControl><Input {...field} placeholder="@sua_frota"/></FormControl></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="socialMedia.facebook" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><FacebookIcon/> Facebook</FormLabel><FormControl><Input {...field} placeholder="/suafrota"/></FormControl></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="socialMedia.whatsapp" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><MessageSquare/> WhatsApp</FormLabel><FormControl><Input {...field} placeholder="Link para o WhatsApp"/></FormControl></FormItem>
                                    )}/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={isSubmitting || isFetchingCep} className="w-full md:w-auto">
                            {(isSubmitting || isFetchingCep) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Perfil da Frota
                        </Button>
                    </div>
                </form>
            </Form>
            
            <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
                <DialogHeader>
                    <DialogTitle>Cortar Logo</DialogTitle>
                    <DialogDescription>Ajuste a imagem para o perfil da sua frota.</DialogDescription>
                </DialogHeader>
                {imgSrc && (
                    <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} minHeight={100}>
                        <img ref={imgRef} alt="Crop me" src={imgSrc} style={{ maxHeight: '70vh' }}/>
                    </ReactCrop>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCropImage}>Salvar Logo</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
