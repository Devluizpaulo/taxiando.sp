
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type CityTip } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TipFormDialog } from './tip-form';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

function TipCard({ tip, onEdit, onDelete }: { tip: CityTip, onEdit: (tip: CityTip) => void, onDelete: (tip: CityTip) => void }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4 p-4">
                 {tip.imageUrls?.[0] && <Image src={tip.imageUrls[0]} alt={tip.title} width={80} height={80} className="rounded-lg object-cover aspect-square" />}
                 <div className="flex-1">
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                    <CardDescription>{tip.location}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{tip.description}</p>
                 </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 mt-auto flex justify-between items-center">
                <Badge variant="outline">{tip.category}</Badge>
                <div className="flex gap-2">
                     <Button variant="ghost" size="icon" onClick={() => onEdit(tip)}><Edit className="h-4 w-4" /></Button>
                     <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground"><Trash2 className="h-4 w-4" /></Button>
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
        // The deleteTip function was removed, so this will now cause an error.
        // This part of the code needs to be updated to remove the dependency on deleteTip.
        // For now, we'll just toast a placeholder message.
        toast({ variant: "destructive", title: "Erro ao Remover", description: "Função de remoção de dica temporariamente indisponível." });
        setTipToDelete(null);
    };

    const handleFormFinished = (newOrUpdatedTip: CityTip) => {
        if(selectedTip) { // it was an edit
            setTips(tips.map(t => t.id === newOrUpdatedTip.id ? newOrUpdatedTip : t));
        } else { // it was a create
            setTips([newOrUpdatedTip, ...tips]);
        }
        setIsFormOpen(false);
        setSelectedTip(null);
    }

    const driverTips = tips.filter(t => t.target === 'driver');
    const clientTips = tips.filter(t => t.target === 'client');

    return (
        <div className="flex flex-col gap-8">
            <AlertDialog onOpenChange={(open) => !open && setTipToDelete(null)}>
                <TipFormDialog 
                    isOpen={isFormOpen} 
                    setIsOpen={setIsFormOpen} 
                    tip={selectedTip}
                    onFinished={handleFormFinished}
                />
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Guia da Cidade</h1>
                    <p className="text-muted-foreground">Gerencie as dicas e sugestões que aparecem publicamente no site.</p>
                </div>
                
                 <Card>
                    <CardHeader className="flex-row justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle>Conteúdo do Guia</CardTitle>
                            <CardDescription>Crie ou edite as dicas para motoristas e clientes.</CardDescription>
                        </div>
                        <Button onClick={handleCreate}><PlusCircle/> Criar Nova Dica</Button>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="driver">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="driver">Dicas para o Motorista</TabsTrigger>
                                <TabsTrigger value="client">Dicas para o Cliente</TabsTrigger>
                            </TabsList>
                            <TabsContent value="driver" className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {driverTips.length > 0 ? driverTips.map(tip => (
                                        <TipCard key={tip.id} tip={tip} onEdit={handleEdit} onDelete={() => setTipToDelete(tip)} />
                                    )) : <p className="col-span-full text-center text-muted-foreground">Nenhuma dica para motoristas cadastrada.</p>}
                                </div>
                            </TabsContent>
                             <TabsContent value="client" className="pt-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {clientTips.length > 0 ? clientTips.map(tip => (
                                        <TipCard key={tip.id} tip={tip} onEdit={handleEdit} onDelete={() => setTipToDelete(tip)} />
                                    )) : <p className="col-span-full text-center text-muted-foreground">Nenhuma dica para clientes cadastrada.</p>}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                
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
