
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cityGuideFormSchema, type CityGuideFormValues } from '@/lib/city-guide-schemas';
import { type CityTip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { generateTipWithAI, createOrUpdateTip } from '@/app/actions/city-guide-actions';
import confetti from 'canvas-confetti';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2, Target, MapPin, Image as ImageIcon, Globe, Users, Car, Star, Zap, Lightbulb, BookOpen, Coffee, ShoppingBag, Camera, Music, Heart, Building, Tag, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FirebaseImageUpload } from '@/components/ui/firebase-image-upload';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getGlobalSettings, updateGlobalSettings } from '@/app/actions/admin-actions';

interface TipFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    tip: CityTip | null;
    onFinished: (tip: CityTip) => void;
}

// Badge/Color map for categories
const categoryOptions = [
  { value: 'comer-beber', label: 'Comer & Beber 🍽️', desc: 'Restaurantes, cafés, bares, padarias, etc.' },
  { value: 'arte-cultura', label: 'Arte & Cultura 🎨', desc: 'Museus, exposições, teatros, centros culturais.' },
  { value: 'pontos-turisticos', label: 'Pontos Turísticos 📷', desc: 'Atrações, monumentos, mirantes.' },
  { value: 'vida-noturna', label: 'Vida Noturna 🌃', desc: 'Bares, baladas, pubs.' },
  { value: 'descanso-bemestar', label: 'Descanso & Bem-estar 🧘‍♂️', desc: 'Parques, spas, cafés calmos.' },
  { value: 'roteiros-batevolta', label: 'Roteiros & Bate-volta 🚘', desc: 'Passeios, day off, viagens curtas.' },
  { value: 'compras', label: 'Compras 🛍️', desc: 'Shoppings, feirinhas, outlets.' },
  { value: 'aventura-natureza', label: 'Aventura & Natureza 🌳', desc: 'Trilhas, cachoeiras, parques naturais.' },
  { value: 'com-criancas', label: 'Com Crianças 👨‍👩‍👧‍👦', desc: 'Atrações family-friendly.' },
  { value: 'pet-friendly', label: 'Pet Friendly 🐶', desc: 'Locais que aceitam pets.' },
];
const profileOptions = [
  { value: 'driver', label: 'Motoristas 🚖', desc: 'Locais para relaxar, comer bem ou curtir o day off.' },
  { value: 'client', label: 'Passageiros 🧳', desc: 'Roteiros e dicas para quem visita ou mora na cidade.' },
  { value: 'both', label: 'Ambos 🤝', desc: 'Locais úteis ou interessantes para os dois públicos.' },
];

const examplePrompts = {
    driver: [
        "Padaria 24h com estacionamento fácil na Zona Sul",
        "Estacionamento seguro próximo à Av. Paulista",
        "Restaurante barato e rápido para almoço de motorista",
        "Roteiro de descanso para day off em São Paulo",
        "Melhor lugar para lanchar durante a madrugada",
        "Posto de combustível com banheiro limpo e café",
        "Roteiro de day off: parques e praças para relaxar",
        "Dica de lugar para cochilar com segurança",
        "Mercado com promoções para motoristas",
        "Roteiro de food trucks para motoristas à noite"
    ],
    client: [
        "Passeio cultural no centro histórico de SP",
        "Bar com música ao vivo na Vila Madalena",
        "Roteiro de bares para sexta à noite",
        "Restaurante romântico com vista para a cidade",
        "Roteiro turístico para conhecer a Avenida Paulista",
        "Café instagramável para brunch no domingo",
        "Roteiro de day off: museus e exposições",
        "Melhor sorveteria artesanal da Zona Oeste",
        "Roteiro de passeios bate-volta no interior",
        "Dica de bar pet friendly para happy hour"
    ]
};

function DicaPreviewCard({ values }: { values: CityGuideFormValues }) {
    const cat = categoryOptions.find(c => c.value === values.category);
    const pub = profileOptions.find(p => p.value === values.target);
    const tags = values.tags || [];
    return (
        <Card className="w-full max-w-xs shadow-xl border-0 bg-white/90">
            <CardHeader className="p-4 flex flex-row gap-4 items-center">
                {values.imageUrls && values.imageUrls[0] ? (
                    <Image src={values.imageUrls[0]} alt={values.title} width={64} height={64} className="rounded-lg object-cover aspect-square border-2 border-indigo-100" />
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-indigo-300" />
                    </div>
                )}
                <div className="flex-1">
                    <CardTitle className="text-base font-bold line-clamp-1">{values.title || <span className="text-gray-400">Título da dica</span>}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs mt-1">
                        {cat && <span className={`px-2 py-0.5 rounded-full font-medium ${cat.value.includes('beber') ? 'bg-orange-100 text-orange-700' : cat.value.includes('arte') ? 'bg-purple-100 text-purple-700' : cat.value.includes('turisticos') ? 'bg-indigo-100 text-indigo-700' : cat.value.includes('noturna') ? 'bg-pink-100 text-pink-700' : cat.value.includes('descanso') ? 'bg-green-100 text-green-700' : cat.value.includes('roteiros') ? 'bg-blue-100 text-blue-700' : cat.value.includes('compras') ? 'bg-yellow-100 text-yellow-700' : cat.value.includes('aventura') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} flex items-center gap-1`}>{cat.label}</span>}
                        {pub && <span className={`px-2 py-0.5 rounded-full font-medium ${pub.value === 'driver' ? 'bg-blue-100 text-blue-700' : pub.value === 'client' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'} flex items-center gap-1`}>{pub.label}</span>}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">{values.description || <span className="text-gray-400">Descrição curta da dica</span>}</p>
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700">#{tag}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function TipFormDialog({ isOpen, setIsOpen, tip, onFinished }: TipFormDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [selectedExample, setSelectedExample] = useState<string>('');
    // Estado para histórico de prompts
    const [promptHistory, setPromptHistory] = useState<string[]>([]);
    
    // Adicione estados para novas categorias e regiões:
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [customRegions, setCustomRegions] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [newRegion, setNewRegion] = useState('');

    const validCategories = categoryOptions.map(c => c.value);
    const validTargets = profileOptions.map(p => p.value);
    const convertCategory = (cat: string | undefined) => validCategories.includes(cat as any) ? cat : undefined;
    const convertTarget = (t: string | undefined) => validTargets.includes(t as any) ? t : undefined;
    
    const form = useForm<CityGuideFormValues>({
        resolver: zodResolver(cityGuideFormSchema),
        defaultValues: tip ? {
            ...tip,
            category: convertCategory(tip.category) as CityGuideFormValues['category'],
            target: convertTarget(tip.target) as CityGuideFormValues['target'],
            imageUrls: Array.isArray(tip.imageUrls) ? tip.imageUrls : [],
        } : {
            title: '',
            category: undefined,
            description: '',
            location: '',
            region: undefined,
            imageUrls: [],
            mapUrl: '',
            target: undefined,
            tags: [],
            comment: '',
        }
    });
    
    const target = form.watch('target');
    const category = form.watch('category');
    const imageUrls = form.watch('imageUrls');
    const tags = form.watch('tags');
    const title = form.watch('title');
    const description = form.watch('description');
    const location = form.watch('location');

    // Sugestão automática ao trocar perfil
    useEffect(() => {
      const exs = examplePrompts[target as 'driver' | 'client'] || [];
      if (exs.length > 0) {
        const random = exs[Math.floor(Math.random() * exs.length)];
        setAiPrompt(random);
        setSelectedExample(random);
      }
      // eslint-disable-next-line
    }, [target]);
    // Função Surpreenda-me
    const handleSurpreenda = () => {
      const exs = examplePrompts[target as 'driver' | 'client'] || [];
      if (exs.length > 0) {
        const random = exs[Math.floor(Math.random() * exs.length)];
        setAiPrompt(random);
        setSelectedExample(random);
      }
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Digite um prompt para gerar o conteúdo.' });
            return;
        }

        setIsGeneratingAI(true);
        try {
            const aiTarget = target === 'both' ? 'driver' : target;
            const result = await generateTipWithAI({
                topic: aiPrompt,
                target: aiTarget as 'driver' | 'client',
            });

            if (result.success && result.data) {
                form.setValue('title', result.data.title);
                form.setValue('description', result.data.description);
                if ('tags' in result.data && Array.isArray(result.data.tags)) form.setValue('tags', result.data.tags);
                // Confete ao sucesso
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
                // Atualiza histórico
                setPromptHistory(prev => [aiPrompt, ...prev.filter(p => p !== aiPrompt)].slice(0, 3));
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erro ao gerar dica', description: (e as Error).message });
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
            const result = await createOrUpdateTip(values);
            if (result.success && result.tip) {
                onFinished(result.tip);
                toast({ title: 'Dica salva!', description: 'A dica foi salva com sucesso.' });
            } else {
                toast({ variant: 'destructive', title: 'Erro ao salvar', description: result.error });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: (e as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Sugestão de tags (mock)
    const tagSuggestions = ['barato', '24h', 'wifi', 'petfriendly', 'estacionamento', 'banheiro', 'turístico', 'família', 'acessível', 'delivery'];
    const addTag = (tag: string) => {
        if (!tags.includes(tag)) form.setValue('tags', [...tags, tag]);
    };
    const removeTag = (tag: string) => {
        form.setValue('tags', tags.filter((t: string) => t !== tag));
    };
    
    useEffect(() => {
      async function fetchGlobals() {
        const settings = await getGlobalSettings();
        if ((settings as any).cityGuideCategories) setCustomCategories((settings as any).cityGuideCategories);
        if ((settings as any).cityGuideRegions) setCustomRegions((settings as any).cityGuideRegions);
      }
      fetchGlobals();
    }, []);

    const handleAddCategory = async () => {
      if (newCategory && !customCategories.includes(newCategory)) {
        const updated = [...customCategories, newCategory];
        setCustomCategories(updated);
        setNewCategory('');
        await updateGlobalSettings({ ...( { cityGuideCategories: updated } as any ) });
      }
    };

    const handleAddRegion = async () => {
      if (newRegion && !customRegions.includes(newRegion)) {
        const updated = [...customRegions, newRegion];
        setCustomRegions(updated);
        setNewRegion('');
        await updateGlobalSettings({ ...( { cityGuideRegions: updated } as any ) });
      }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-6xl p-0 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 max-h-[85vh] overflow-y-auto mx-auto">
                <DialogTitle className="sr-only">{tip ? 'Editar Dica' : 'Criar Nova Dica'}</DialogTitle>
                {/* Header horizontal no topo */}
                <div className="w-full flex flex-col items-center justify-center px-2 pt-6 pb-2 md:pt-8 md:pb-4">
                    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
                        <div className="flex items-center gap-3 mb-1">
                            <Sparkles className="h-8 w-8 text-pink-400" />
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{tip ? 'Editar Dica' : 'Criar Nova Dica'}</h2>
                        </div>
                        <div className="text-base text-gray-500 font-medium mb-2 text-center">Crie dicas incríveis para motoristas e passageiros de São Paulo</div>
                        <Separator className="mb-2" />
                                    </div>
                                </div>
                {/* Sessão de IA full width */}
                <div className="w-full max-w-5xl mx-auto mb-8">
  <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 rounded-2xl shadow-xl border border-orange-100 p-8 xl:p-12 flex flex-col gap-8">
    <div className="flex flex-col md:flex-row gap-8 w-full items-start">
      {/* Coluna esquerda: Tabs + exemplos em carrossel horizontal */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-orange-400" />
          <span className="font-bold text-lg text-gray-800">Assistente de IA</span>
        </div>
        <Tabs value={target || 'driver'} onValueChange={v => form.setValue('target', v as any)} className="w-full mb-2">
          <TabsList className="grid grid-cols-2 bg-white rounded-xl shadow border border-orange-100 mb-2">
            <TabsTrigger value="driver" className="flex items-center gap-2 text-base font-bold data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:shadow-md transition"><Car className="h-5 w-5" /> Motorista</TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2 text-base font-bold data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 data-[state=active]:shadow-md transition"><Users className="h-5 w-5" /> Cliente</TabsTrigger>
          </TabsList>
        </Tabs>
        {/* Exemplo de prompts e Surpreenda-me */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-600">Exemplos de prompts:</span>
          <Button type="button" size="sm" variant="ghost" className="text-orange-500 hover:bg-orange-100 px-2 py-1 rounded-full font-semibold text-xs" onClick={handleSurpreenda}>
            🎲 Surpreenda-me!
          </Button>
        </div>
        {(examplePrompts[target as 'driver' | 'client'] || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
            {examplePrompts[target as 'driver' | 'client'].map(example => (
                                            <button
                key={example}
                                                type="button"
                className={`bg-orange-50 border border-orange-100 text-gray-700 rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition-all duration-150 flex items-center gap-2 w-full
                  ${aiPrompt === example ? 'ring-2 ring-pink-300 bg-pink-50 scale-105' : 'hover:bg-orange-100 active:scale-95'}`}
                onClick={() => {
                  setAiPrompt(example);
                  setSelectedExample(example);
                }}
                aria-pressed={aiPrompt === example}
                                            >
                                                {example}
                {aiPrompt === example && (
                  <CheckCircle className="ml-1 h-4 w-4 text-pink-400 animate-bounce-in" />
                )}
                                            </button>
                                        ))}
                                    </div>
        ) : (
          <span className="text-xs text-gray-400 ml-2">Nenhum exemplo disponível para este perfil.</span>
        )}
      </div>
      {/* Coluna direita: Prompt e botão IA */}
      <div className="w-full md:w-1/2 flex flex-col gap-4 justify-center">
        <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
          Ou escreva seu próprio prompt:
          <Info className="h-4 w-4 text-gray-300" />
                                </div>
        <div className="relative">
                                    <Textarea
                                        value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder={target === 'driver' ? 'Ex: padaria 24h com estacionamento fácil, roteiro de day off para motorista...' : 'Ex: passeio cultural no centro, bar com música ao vivo, roteiro bate-volta...'}
            className="bg-white border border-orange-200 rounded-xl px-4 py-3 text-base font-medium shadow-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition pr-16"
            maxLength={200}
          />
          <span className="absolute bottom-2 right-4 text-xs text-gray-400">{aiPrompt.length}/200</span>
                                </div>
        {promptHistory.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
    {promptHistory.map((h, i) => (
      <button
        key={h + i}
        type="button"
        className="bg-pink-50 border border-pink-200 text-pink-700 rounded-full px-3 py-1 text-xs font-medium shadow-sm hover:bg-pink-100 transition"
        onClick={() => setAiPrompt(h)}
      >
        {h}
      </button>
    ))}
  </div>
)}
        <Button type="button" onClick={handleGenerateAI} disabled={isGeneratingAI} className="w-full mt-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold shadow-lg rounded-xl py-3 text-lg border-0 hover:from-pink-400 hover:to-orange-400 transition-all focus:ring-2 focus:ring-pink-200 flex items-center justify-center gap-2 relative overflow-hidden">
          <Sparkles className="h-5 w-5" />
          {isGeneratingAI && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><Loader2 className="animate-spin h-6 w-6 text-white opacity-70" /></span>}
          <span className={isGeneratingAI ? 'opacity-50' : ''}>Gerar Conteúdo com IA</span>
                                </Button>
      </div>
                                    </div>
                                </div>
                    </div>
                {/* Grid de duas colunas: Formulário e Preview */}
                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[40vh] p-4 md:p-6 xl:p-8 items-stretch">
                    {/* Coluna 1: Formulário */}
                    <div className="flex flex-col h-full items-center bg-white rounded-2xl shadow-xl border border-gray-100 p-8 xl:p-12">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7 flex-1 flex flex-col">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Título */}
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                            <FormLabel className="text-base font-bold text-gray-800">Título da Dica</FormLabel>
                                        <FormControl>
                                                <Input {...field} placeholder="Ex: Feijoada do Bolinha" className="bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )} />
                                    {/* Descrição */}
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                            <FormLabel className="text-base font-bold text-gray-800">Descrição</FormLabel>
                                        <FormControl>
                                                <Textarea {...field} placeholder="Descreva o local, o que o torna especial, horários, características únicas..." className="min-h-[80px] bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm" maxLength={180} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )} />
                                    {/* Opinião sincera */}
                                <FormField
  control={form.control}
  name="comment"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-base font-bold text-gray-800">Opinião sincera (opcional)</FormLabel>
      <FormControl>
        <Textarea {...field} placeholder="Compartilhe uma experiência pessoal, dica extra ou opinião sincera sobre este local..." className="min-h-[80px] bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm" maxLength={300} />
      </FormControl>
      <FormDescription>Este campo é opcional. Use para dar um toque pessoal ou uma dica extra para outros motoristas ou passageiros.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
                                    {/* Categoria */}
                                    <FormField control={form.control} name="category" render={({ field }) => (
                                        <FormItem>
    <FormLabel className="text-base font-bold text-gray-800">Tipo de Dica *</FormLabel>
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm w-full">
        <SelectValue placeholder="Selecione o tipo de dica" />
                                                    </SelectTrigger>
                                                <SelectContent>
        {categoryOptions.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="flex flex-col items-start gap-0">
            <span className="font-semibold text-base">{opt.label}</span>
            <span className="text-xs text-gray-500">{opt.desc}</span>
          </SelectItem>
        ))}
        {customCategories.map(opt => (
          <SelectItem key={opt} value={opt} className="flex flex-col items-start gap-0">
            <span className="font-semibold text-base">{opt}</span>
            <span className="text-xs text-gray-500">(Personalizada)</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
    <div className="flex gap-2 mt-2">
      <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nova categoria" className="w-2/3" />
      <Button type="button" size="sm" onClick={handleAddCategory}>
        Adicionar
      </Button>
    </div>
    <FormDescription>Escolha a categoria que melhor representa a dica ou adicione uma nova.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
)} />
                                    {/* Localização */}
                                    <FormField control={form.control} name="location" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-bold text-gray-800">Localização (endereço completo, bairro, cidade, região) *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ex: Av. Paulista, 1000, Bela Vista, São Paulo, Zona Central" className="bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-base font-medium shadow-sm" />
                                            </FormControl>
                                            <FormDescription>Informe o endereço completo, bairro, cidade e região. Isso é essencial para que os filtros por região/cidade funcionem corretamente e para que outros encontrem a dica facilmente.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    {/* Perfil */}
                                <FormField control={form.control} name="target" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-base font-bold text-gray-800">Perfil *</FormLabel>
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm w-full">
        <SelectValue placeholder="Selecione o perfil" />
      </SelectTrigger>
      <SelectContent>
        {profileOptions.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="flex flex-col items-start gap-0">
            <span className="font-semibold text-base">{opt.label}</span>
            <span className="text-xs text-gray-500">{opt.desc}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <FormDescription>Para quem essa dica é mais útil?</FormDescription>
    <FormMessage />
  </FormItem>
)} />
                                    {/* Imagem */}
                                                                 <FormField control={form.control} name="imageUrls" render={({ field }) => (
                                    <FormItem>
                                            <FormLabel className="text-base font-bold text-gray-800">Imagem de Dica</FormLabel>
                                        <FormControl>
                                                <FirebaseImageUpload value={field.value[0] || ''} onChange={url => field.onChange(url ? [url] : [])} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )} />
                                    {/* URL do Mapa */}
                                <FormField control={form.control} name="mapUrl" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-bold text-gray-800">URL do Mapa (Opcional)</FormLabel>
                                                <FormControl>
                                                <Input {...field} placeholder="https://maps.app.goo.gl/..." className="bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm" />
                                                </FormControl>
                                            <FormDescription>Link do Google Maps para facilitar a localização</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    {/* Faixa de Preço */}
                                <FormField control={form.control} name="priceRange" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-base font-bold text-gray-800">Faixa de Preço *</FormLabel>
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm w-full">
        <SelectValue placeholder="Selecione a faixa de preço" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="$">$ (Econômico)</SelectItem>
        <SelectItem value="$$">$$ (Acessível)</SelectItem>
        <SelectItem value="$$$">$$$ (Intermediário)</SelectItem>
        <SelectItem value="$$$$">$$$$ (Premium)</SelectItem>
      </SelectContent>
    </Select>
    <FormDescription>Ajuda o usuário a saber o custo médio do local.</FormDescription>
    <FormMessage />
  </FormItem>
)} />
                                    {/* Horário de Funcionamento */}
                                <FormField control={form.control} name="openingHours" render={({ field }) => (
  <FormItem>
    <FormLabel className="text-base font-bold text-gray-800">Horário de Funcionamento</FormLabel>
    <FormControl>
      <Input {...field} placeholder="Ex: Seg a Sex 8h-22h, Sáb 10h-18h" className="bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition text-base font-medium shadow-sm" />
    </FormControl>
    <FormDescription>Informe os horários para facilitar o planejamento do usuário.</FormDescription>
    <FormMessage />
  </FormItem>
)} />
                                </div>
                                <DialogFooter className="mt-8 flex flex-col gap-2 w-full">
                                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                                        <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold shadow-lg rounded-full py-3 text-lg border-0 hover:from-pink-400 hover:to-orange-400 transition-all focus:ring-2 focus:ring-pink-200">
                                            {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                            <span className="tracking-wide">Criar Dica</span>
                                        </Button>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline" className="w-full sm:w-auto border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full py-3 text-lg focus:ring-2 focus:ring-pink-200">Cancelar</Button>
                                    </DialogClose>
                                    </div>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                    {/* Coluna 2: Preview da Imagem */}
                    <div className="flex flex-col h-full items-center justify-center bg-white rounded-2xl shadow-xl border border-gray-100 p-8 xl:p-12">
                        <span className="text-lg font-bold text-gray-800 mb-4 text-center w-full">Preview da Imagem</span>
                        {imageUrls && imageUrls[0] ? (
                            <Image src={imageUrls[0]} alt="Preview" width={360} height={160} className="rounded-2xl object-cover border-2 border-pink-200 shadow-md w-full max-w-[360px] h-64 md:h-72 mx-auto" />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-64 md:h-72">
                                <ImageIcon className="h-16 w-16 text-gray-300 mb-2" />
                                <span className="text-gray-400 text-base font-medium">Imagem de dica</span>
                            </div>
                        )}
                        <span className="text-gray-500 text-xs mt-4 text-center w-full">A imagem será exibida em destaque na dica publicada.</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
