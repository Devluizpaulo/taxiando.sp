
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type CityTip } from '@/lib/types';
import { deleteTip } from '@/app/actions/city-guide-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Edit, Search, Filter, X, Tag, MapPin, Loader2, Info, ChevronDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TipFormDialog } from './tip-form';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryOptions = [
  'Gastronomia', 'Lazer', 'Cultura', 'Transporte', 'Compras', 'Entretenimento', 'Turismo', 'Negócios'
];
const regionOptions = [
  'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Centro', 'ABC', 'Litoral Norte', 'Litoral Sul', 'Vale do Paraíba', 'Interior'
];

function TipCard({ tip, onEdit, onDelete }: { tip: CityTip, onEdit: (tip: CityTip) => void, onDelete: (tip: CityTip) => void }) {
    return (
        <Card className="flex flex-col shadow-lg border-0 hover:shadow-2xl transition-all duration-300 group bg-white">
            <CardHeader className="flex-row items-start gap-4 p-4">
                 {tip.imageUrls?.[0] && <Image src={tip.imageUrls[0]} alt={tip.title} width={80} height={80} className="rounded-lg object-cover aspect-square border-2 border-indigo-100 group-hover:border-indigo-300 transition" />}
                 <div className="flex-1">
                    <CardTitle className="text-lg font-bold group-hover:text-indigo-700 transition-colors">{tip.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-indigo-400" />
                      {tip.location}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{tip.description}</p>
                 </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 mt-auto flex justify-between items-center">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-0">
                  <Tag className="h-3 w-3 mr-1" />
                  {tip.category}
                </Badge>
                <div className="flex gap-2">
                     <Button variant="ghost" size="icon" onClick={() => onEdit(tip)} title="Editar dica"><Edit className="h-4 w-4" /></Button>
                     <AlertDialogTrigger asChild>
                         <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-destructive hover:text-destructive-foreground"
                             title="Excluir dica"
                             onClick={() => onDelete(tip)}
                         >
                             <Trash2 className="h-4 w-4" />
                         </Button>
                     </AlertDialogTrigger>
                </div>
            </CardContent>
        </Card>
    );
}

export function CityGuideClientPage({ initialTips }: { initialTips: CityTip[] }) {
    const [tips, setTips] = useState<CityTip[]>(initialTips);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTip, setSelectedTip] = useState<CityTip | null>(null);
    const [tipToDelete, setTipToDelete] = useState<CityTip | null>(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [region, setRegion] = useState('all');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        setTips(initialTips);
    }, [initialTips]);
    
    const handleEdit = (tip: CityTip) => {
        setSelectedTip(tip);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedTip(null);
        setIsFormOpen(true);
    }
    
    const handleDelete = async () => {
        if (!tipToDelete) return;
        setLoading(true);
        try {
            const result = await deleteTip(tipToDelete.id);
            if (result.success) {
                setTips(tips.filter(t => t.id !== tipToDelete.id));
                toast({ title: "Dica Removida!", description: "A dica foi removida com sucesso." });
            } else {
                toast({ variant: 'destructive', title: "Erro ao Remover", description: result.error });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro ao Remover", description: (error as Error).message });
        } finally {
            setLoading(false);
            setTipToDelete(null);
        }
    };

    const handleFormFinished = (newOrUpdatedTip: CityTip) => {
        if(selectedTip) {
            setTips(tips.map(t => t.id === newOrUpdatedTip.id ? newOrUpdatedTip : t));
        } else {
            setTips([newOrUpdatedTip, ...tips]);
        }
        setIsFormOpen(false);
        setSelectedTip(null);
    }

    // Filtro e busca
    const filteredTips = tips.filter(tip => {
      const matchesSearch = !search || tip.title.toLowerCase().includes(search.toLowerCase()) || tip.location.toLowerCase().includes(search.toLowerCase()) || tip.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || tip.category === category;
      const matchesRegion = region === 'all' || (tip.location && tip.location.includes(region));
      return matchesSearch && matchesCategory && matchesRegion;
    });

    const driverTips = filteredTips.filter(t => t.target === 'driver');
    const clientTips = filteredTips.filter(t => t.target === 'client');

    return (
        <div className="flex flex-col gap-10">
            <AlertDialog onOpenChange={(open) => !open && setTipToDelete(null)}>
                <TipFormDialog 
                    isOpen={isFormOpen} 
                    setIsOpen={setIsFormOpen} 
                    tip={selectedTip}
                    onFinished={handleFormFinished}
                />
                {/* Header premium */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6 px-2 md:px-0">
                    <div className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-pink-400 to-orange-300 p-2 shadow-lg">
                            <MapPin className="h-8 w-8 text-white drop-shadow" />
                        </span>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-pink-500 to-orange-400 bg-clip-text text-transparent animate-gradient-x">Guia da Cidade</h1>
                            <p className="text-muted-foreground text-base font-medium mt-1">Gerencie as dicas e sugestões que aparecem publicamente no site.</p>
                        </div>
                    </div>
                    <Button onClick={handleCreate} className="bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-400 text-white font-bold shadow-xl hover:from-indigo-600 hover:to-pink-600 rounded-full px-6 py-3 text-lg flex items-center gap-2 animate-bounce-once">
                        <PlusCircle className="mr-2" /> Nova Dica
                    </Button>
                </div>
                {/* Barra de busca e filtros premium */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 w-full max-w-5xl mx-auto">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 h-5 w-5" />
                        <Input
                            placeholder="Buscar por título, local ou categoria..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-12 pr-12 py-3 text-lg bg-white border-2 border-indigo-100 rounded-xl shadow-md focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition"
                        />
                        {search && (
                            <Button size="icon" variant="ghost" className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:bg-pink-50 transition" onClick={() => setSearch('')}><X className="h-5 w-5" /></Button>
                        )}
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-56 bg-white border-2 border-indigo-100 rounded-xl shadow-md text-lg">
                            <Tag className="h-5 w-5 mr-2 text-indigo-400" />
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categoryOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="w-56 bg-white border-2 border-indigo-100 rounded-xl shadow-md text-lg">
                            <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
                            <SelectValue placeholder="Região" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as regiões</SelectItem>
                            {regionOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Conteúdo do Guia com tabs e cards premium */}
                <Card className="bg-white/90 shadow-2xl rounded-3xl border-0">
                    <CardHeader className="flex-row justify-between items-center bg-gradient-to-r from-indigo-50 via-pink-50 to-orange-50 rounded-t-3xl p-6 border-b border-gray-100">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-extrabold text-gray-900">Conteúdo do Guia</CardTitle>
                            <CardDescription className="text-base text-gray-500">Crie ou edite as dicas para motoristas e clientes.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Tabs defaultValue="driver">
                            <TabsList className="grid w-full grid-cols-2 bg-white shadow-md rounded-xl mb-6">
                                <TabsTrigger value="driver" className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-100 data-[state=active]:to-pink-100 data-[state=active]:text-indigo-700 data-[state=active]:shadow-md transition">Dicas para o Motorista <Badge className="ml-2 bg-indigo-100 text-indigo-700 animate-pulse">{driverTips.length}</Badge></TabsTrigger>
                                <TabsTrigger value="client" className="text-lg font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-orange-100 data-[state=active]:text-pink-700 data-[state=active]:shadow-md transition">Dicas para o Cliente <Badge className="ml-2 bg-pink-100 text-pink-700 animate-pulse">{clientTips.length}</Badge></TabsTrigger>
                            </TabsList>
                            <TabsContent value="driver" className="pt-4">
                                {loading && <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-indigo-500 mr-2" /> Removendo dica...</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {driverTips.length > 0 ? driverTips.map(tip => (
                                        <TipCard key={tip.id} tip={tip} onEdit={handleEdit} onDelete={setTipToDelete} />
                                    )) : <p className="col-span-full text-center text-muted-foreground">Nenhuma dica para motoristas cadastrada.</p>}
                                </div>
                            </TabsContent>
                            <TabsContent value="client" className="pt-4">
                                {loading && <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-pink-500 mr-2" /> Removendo dica...</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {clientTips.length > 0 ? clientTips.map(tip => (
                                        <TipCard key={tip.id} tip={tip} onEdit={handleEdit} onDelete={setTipToDelete} />
                                    )) : <p className="col-span-full text-center text-muted-foreground">Nenhuma dica para clientes cadastrada.</p>}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                {/* Dialog de confirmação de exclusão */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação removerá a dica permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Sim, remover dica</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
