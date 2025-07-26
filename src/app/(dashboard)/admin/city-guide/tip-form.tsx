
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { type CityTip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { generateTipWithAI, createOrUpdateTip } from '@/app/actions/city-guide-actions';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, Target, MapPin, Image as ImageIcon, Globe, Users, Car, Star, Zap, Lightbulb, BookOpen, Coffee, ShoppingBag, Camera, Music, Heart, Building } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FirebaseImageUpload } from '@/components/ui/firebase-image-upload';
import { Badge } from '@/components/ui/badge';

interface TipFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    tip: CityTip | null;
    onFinished: (tip: CityTip) => void;
}

const categoryOptions = [
    { value: 'Gastronomia', label: 'Gastronomia', icon: Coffee, color: 'bg-orange-100 text-orange-700' },
    { value: 'Lazer', label: 'Lazer', icon: Heart, color: 'bg-pink-100 text-pink-700' },
    { value: 'Cultura', label: 'Cultura', icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
    { value: 'Transporte', label: 'Transporte', icon: Car, color: 'bg-blue-100 text-blue-700' },
    { value: 'Compras', label: 'Compras', icon: ShoppingBag, color: 'bg-green-100 text-green-700' },
    { value: 'Entretenimento', label: 'Entretenimento', icon: Music, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'Turismo', label: 'Turismo', icon: Camera, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'Negócios', label: 'Negócios', icon: Building, color: 'bg-gray-100 text-gray-700' },
];

const examplePrompts = {
    driver: [
        "ponto de táxi movimentado na Avenida Paulista",
        "estacionamento gratuito no centro de São Paulo",
        "restaurante popular para almoço em Pinheiros",
        "shopping center com movimento intenso aos finais de semana",
        "hospital com entrada para táxis"
    ],
    client: [
        "restaurante japonês autêntico em Liberdade",
        "café com vista para o parque Ibirapuera",
        "loja de roupas vintage na Vila Madalena",
        "teatro com programação cultural diversificada",
        "padaria tradicional no bairro da Mooca"
    ]
};

export function TipFormDialog({ isOpen, setIsOpen, tip, onFinished }: TipFormDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [selectedExample, setSelectedExample] = useState<string>('');
    
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
            });

            if (result.success && result.data) {
                // Preencher o formulário com os dados gerados pela IA
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
                    title: '✨ Conteúdo Gerado!', 
                    description: 'A IA preencheu o formulário com sucesso.' 
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

    const handleExampleClick = (example: string) => {
        setAiPrompt(example);
        setSelectedExample(example);
    };

    const onSubmit = async (values: CityGuideFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createOrUpdateTip(values, tip?.id);
            
            if (result.success && result.tip) {
            toast({ title: tip ? 'Dica Atualizada!' : 'Dica Criada!', description: 'A dica foi salva com sucesso.' });
                onFinished(result.tip);
            } else {
                toast({ variant: 'destructive', title: 'Erro ao Salvar', description: result.error });
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
                 setSelectedExample('');
             }
             setIsOpen(open);
        }}>
            <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Sparkles className="h-6 w-6 text-orange-500" />
                        {tip ? 'Editar Dica' : 'Criar Nova Dica'}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        Crie dicas incríveis para motoristas e passageiros de São Paulo
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna Esquerda - Assistente de IA */}
                    <div className="space-y-6">
                        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Wand2 className="h-5 w-5 text-orange-500" />
                                    Assistente de IA
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Deixe a IA criar conteúdo completo para você
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Público-Alvo */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Para quem é esta dica?</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => form.setValue('target', 'driver')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                target === 'driver' 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                            }`}
                                        >
                                            <Car className="h-6 w-6 mx-auto mb-2" />
                                            <div className="font-semibold">Motorista</div>
                                            <div className="text-xs opacity-75">Informações práticas</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => form.setValue('target', 'client')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                target === 'client' 
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                                    : 'border-gray-200 bg-white hover:border-emerald-300'
                                            }`}
                                        >
                                            <Users className="h-6 w-6 mx-auto mb-2" />
                                            <div className="font-semibold">Cliente</div>
                                            <div className="text-xs opacity-75">Experiências</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Exemplos de Prompts */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Exemplos de prompts:</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {examplePrompts[target].map((example, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleExampleClick(example)}
                                                className={`p-3 text-left rounded-lg border transition-all text-sm ${
                                                    selectedExample === example
                                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                        : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                                                }`}
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Prompt Personalizado */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Ou escreva seu próprio prompt:</label>
                                    <Textarea
                                        placeholder="Ex: restaurante japonês em Pinheiros, ponto de táxi na Paulista, shopping no centro..."
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="min-h-[120px] resize-none"
                                    />
                                </div>

                                <Button 
                                    onClick={handleGenerateAI} 
                                    disabled={isGeneratingAI || !aiPrompt.trim()}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                                >
                                    {isGeneratingAI ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Gerando Conteúdo...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            Gerar Conteúdo com IA
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Preview da Imagem */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-blue-500" />
                                    Preview da Imagem
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                    <div className="text-center">
                                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                        <p className="text-sm">Imagem da dica</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna Direita - Formulário */}
                    <div className="space-y-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            Título da Dica
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: Feijoada do Bolinha" className="text-lg" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Descrição
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field} 
                                                placeholder="Descreva o local, o que o torna especial, horários, características únicas..." 
                                                className="min-h-[120px] text-base"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="category" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                <Lightbulb className="h-4 w-4" />
                                                Categoria
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione uma categoria" />
                                                    </SelectTrigger>
                                            </FormControl>
                                                <SelectContent>
                                                    {categoryOptions.map((category) => (
                                                        <SelectItem key={category.value} value={category.value}>
                                                            <div className="flex items-center gap-2">
                                                                <category.icon className="h-4 w-4" />
                                                                {category.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="location" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Localização
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ex: Vila Madalena, São Paulo" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                
                                                                 <FormField control={form.control} name="imageUrls" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                                            <Camera className="h-4 w-4" />
                                            Imagem da Dica
                                        </FormLabel>
                                        <FormControl>
                                            <FirebaseImageUpload
                                                value={field.value?.[0]}
                                                onChange={url => field.onChange([url])}
                                                pathPrefix={`city-tips/`}
                                                label="Escolher Imagem"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                <FormField control={form.control} name="mapUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                                            <Globe className="h-4 w-4" />
                                            URL do Mapa (Opcional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://maps.app.goo.gl/..." />
                                        </FormControl>
                                        <FormDescription>
                                            Link do Google Maps para facilitar a localização
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                {target === 'client' && (
                                    <FormField control={form.control} name="priceRange" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                <Star className="h-4 w-4" />
                                                Faixa de Preço (para Clientes)
                                            </FormLabel>
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
                                
                                <Separator />
                                
                                <DialogFooter className="gap-3">
                                    <DialogClose asChild>
                                        <Button type="button" variant="ghost" size="lg">
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isSubmitting} size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {tip ? 'Atualizar Dica' : 'Criar Dica'}
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
