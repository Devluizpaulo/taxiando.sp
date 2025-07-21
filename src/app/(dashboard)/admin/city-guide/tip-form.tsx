
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { type CityTip } from '@/lib/types';
import { createOrUpdateTip, generateTipWithAI } from '@/app/actions/supabase-city-guide-actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/image-upload';

interface TipFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    tip: CityTip | null;
    onFinished: (tip: CityTip) => void;
}

export function TipFormDialog({ isOpen, setIsOpen, tip, onFinished }: TipFormDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    
    const form = useForm<CityGuideFormValues>({
        resolver: zodResolver(cityGuideFormSchema),
        defaultValues: tip ? {
            ...tip,
        } : {
            title: '',
            category: '',
            description: '',
            location: '',
            imageUrls: [],
            mapUrl: '',
            target: 'driver',
        }
    });
    
    const target = form.watch('target');

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Digite um prompt para gerar o conteúdo.' });
            return;
        }

        setIsGeneratingAI(true);
        try {
            const result = await generateTipWithAI({
                topic: aiPrompt,
                target: target,
                category: form.getValues('category') || undefined,
            });

            if (result.success && result.data) {
                form.setValue('title', result.data.title);
                form.setValue('description', result.data.description);
                form.setValue('category', result.data.category);
                form.setValue('location', result.data.location);
                if (result.data.priceRange) {
                    form.setValue('priceRange', result.data.priceRange);
                }
                if (result.data.mapUrl) {
                    form.setValue('mapUrl', result.data.mapUrl);
                }
                
                toast({ 
                    title: 'Conteúdo Gerado!', 
                    description: 'A IA gerou o conteúdo da dica com sucesso. Revise e ajuste conforme necessário.' 
                });
            } else {
                throw new Error(result.error || 'Erro ao gerar conteúdo');
            }
        } catch (error) {
            toast({ 
                variant: 'destructive', 
                title: 'Erro na IA', 
                description: (error as Error).message || 'Não foi possível gerar o conteúdo.' 
            });
        } finally {
            setIsGeneratingAI(false);
        }
    };

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
             if (!open) { 
                 form.reset(); 
                 setAiPrompt('');
             }
             setIsOpen(open);
        }}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
                    <DialogTitle>{tip ? 'Editar Dica' : 'Criar Nova Dica'}</DialogTitle>
                    <DialogDescription>Preencha os detalhes da dica que será exibida no Guia da Cidade.</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coluna Esquerda - Assistente de IA */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                    Assistente de IA
                                </CardTitle>
                                <CardDescription>
                                    Deseja que o Assistente de IA o ajude a criar uma dica completa?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prompt para IA</label>
                                    <Textarea
                                        placeholder="Por exemplo: gere uma dica sobre restaurante japonês em Pinheiros, ou ponto de táxi movimentado na Paulista..."
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <Button 
                                    onClick={handleGenerateAI} 
                                    disabled={isGeneratingAI || !aiPrompt.trim()}
                                    className="w-full"
                                >
                                    {isGeneratingAI ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Gerar Conteúdo IA
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Preview da Imagem */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview da Imagem</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                    600 x 400
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna Direita - Formulário */}
                    <div className="space-y-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="target" render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Para quem é esta dica?</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="driver" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Motorista</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="client" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Cliente</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título da Dica</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: Feijoada do Bolinha" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field} 
                                                placeholder="Descreva o local, o que o torna especial, etc." 
                                                className="min-h-[120px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="category" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoria</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ex: Gastronomia, Lazer, Cultura" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="location" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Localização</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ex: Vila Madalena, São Paulo" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                
                                                                 <FormField control={form.control} name="imageUrls" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                maxImages={5}
                                                bucket="images"
                                                folder="city-tips"
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="mapUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL do Mapa (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://maps.app.goo.gl/..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                {target === 'client' && (
                                    <FormField control={form.control} name="priceRange" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Faixa de Preço (para Clientes)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione uma faixa de preço" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="$">$ (Econômico)</SelectItem>
                                                    <SelectItem value="$$">$$ (Moderado)</SelectItem>
                                                    <SelectItem value="$$$">$$$ (Caro)</SelectItem>
                                                    <SelectItem value="$$$$">$$$$ (Luxo)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                )}
                                
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="ghost">Cancelar</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar Dica
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
