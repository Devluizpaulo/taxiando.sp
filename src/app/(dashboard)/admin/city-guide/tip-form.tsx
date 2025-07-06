
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { type CityTip } from '@/lib/types';
import { createOrUpdateTip } from '@/app/actions/city-guide-actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TipFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    tip: CityTip | null;
    onFinished: (tip: CityTip) => void;
}

export function TipFormDialog({ isOpen, setIsOpen, tip, onFinished }: TipFormDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<CityGuideFormValues>({
        resolver: zodResolver(cityGuideFormSchema),
        defaultValues: tip ? {
            ...tip,
        } : {
            title: '',
            category: '',
            description: '',
            location: '',
            imageUrl: '',
            mapUrl: '',
            target: 'driver',
        }
    });
    
    const target = form.watch('target');

    const onSubmit = async (values: CityGuideFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createOrUpdateTip(values, tip?.id);
            if (result.success) {
                toast({ title: tip ? 'Dica Atualizada!' : 'Dica Criada!', description: 'A dica foi salva com sucesso.' });
                onFinished(result.tip as CityTip);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
             if (!open) { form.reset(); }
             setIsOpen(open);
        }}>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>{tip ? 'Editar Dica' : 'Criar Nova Dica'}</DialogTitle>
                    <DialogDescription>Preencha os detalhes da dica que será exibida no Guia da Cidade.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                         <FormField control={form.control} name="target" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>Para quem é esta dica?</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="driver" /></FormControl><FormLabel className="font-normal">Motorista</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="client" /></FormControl><FormLabel className="font-normal">Cliente</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Título da Dica</FormLabel><FormControl><Input {...field} placeholder="Ex: Feijoada do Bolinha" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} placeholder="Descreva o local, o que o torna especial, etc." /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} placeholder="Ex: Gastronomia, Lazer, Cultura" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Localização</FormLabel><FormControl><Input {...field} placeholder="Ex: Vila Madalena, São Paulo" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem><FormLabel>URL da Imagem (Opcional)</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="mapUrl" render={({ field }) => (
                                <FormItem><FormLabel>URL do Mapa (Opcional)</FormLabel><FormControl><Input {...field} placeholder="https://maps.app.goo.gl/..." /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        {target === 'client' && (
                            <FormField control={form.control} name="priceRange" render={({ field }) => (
                                <FormItem><FormLabel>Faixa de Preço (para Clientes)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma faixa de preço" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="$">$ (Econômico)</SelectItem>
                                        <SelectItem value="$$">$$ (Moderado)</SelectItem>
                                        <SelectItem value="$$$">$$$ (Caro)</SelectItem>
                                        <SelectItem value="$$$$">$$$$ (Luxo)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage /></FormItem>
                            )}/>
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Dica
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
