
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthProtection } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Instagram, MessageSquare, Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { fleetAmenities } from '@/lib/data';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { LoadingScreen } from '@/components/loading-screen';
import { Label } from '@/components/ui/label';

const fleetProfileSchema = z.object({
  companyDescription: z.string().min(20, "A descrição deve ter no mínimo 20 caracteres.").max(500, "A descrição deve ter no máximo 500 caracteres."),
  
  // New structured address
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
});

type FleetProfileValues = z.infer<typeof fleetProfileSchema>;

export default function FleetProfilePage() {
    const { user, userProfile, loading } = useAuthProtection({ requiredRoles: ['fleet', 'admin'] });
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingCep, setIsFetchingCep] = useState(false);

    const form = useForm<FleetProfileValues>({
        resolver: zodResolver(fleetProfileSchema),
        defaultValues: {
            companyDescription: '',
            zipCode: '',
            address: '',
            addressNumber: '',
            addressComplement: '',
            neighborhood: '',
            city: '',
            state: 'SP',
            contactPhone: '',
            contactEmail: '',
            socialMedia: { instagram: '', facebook: '', whatsapp: '' },
            amenities: [],
            otherAmenities: '',
        },
    });

    useEffect(() => {
        if (!loading && userProfile) {
            form.reset({
                companyDescription: userProfile.companyDescription || '',
                zipCode: userProfile.zipCode || '',
                address: userProfile.address || '',
                addressNumber: userProfile.addressNumber || '',
                addressComplement: userProfile.addressComplement || '',
                neighborhood: userProfile.neighborhood || '',
                city: userProfile.city || '',
                state: userProfile.state || 'SP',
                contactPhone: userProfile.phone || '',
                contactEmail: userProfile.email || '',
                socialMedia: userProfile.socialMedia || { instagram: '', facebook: '', whatsapp: '' },
                amenities: userProfile.amenities?.map(a => a.id) || [],
                otherAmenities: userProfile.otherAmenities || '',
            });
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
            form.setFocus('addressNumber'); // Move focus to the number field
            toast({ title: 'Endereço encontrado!', description: 'Complete com o número e complemento.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar CEP', description: (error as Error).message });
        } finally {
            setIsFetchingCep(false);
        }
    };


     if (loading || !userProfile) {
        return <LoadingScreen />;
    }

    const onSubmit = async (values: FleetProfileValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            const amenitiesToSave = values.amenities?.map(amenityId => {
                return fleetAmenities.find(a => a.id === amenityId)!;
            }) || [];
            
            await updateDoc(userDocRef, {
                ...values,
                amenities: amenitiesToSave,
            });
            toast({
                title: 'Perfil da Frota Atualizado!',
                description: 'As informações da sua frota foram salvas com sucesso.',
            });
        } catch (error) {
            console.error("Error updating fleet profile: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao atualizar',
                description: 'Não foi possível salvar os dados da sua frota. Tente novamente.',
            });
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
        </div>
    );
}
