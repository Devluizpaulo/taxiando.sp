
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { getPartnerById, updatePartner, type PartnerFormValues } from '@/app/actions/marketing-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { LoadingScreen } from '@/components/loading-screen';
import * as z from 'zod';

const partnerFormSchema = z.object({
  name: z.string().min(3, "O nome do parceiro é obrigatório."),
  imageUrl: z.string().url("A URL da imagem é obrigatória e deve ser válida."),
  linkUrl: z.string().url("A URL de destino é obrigatória e deve ser válida."),
  size: z.enum(['small', 'medium', 'large'], { required_error: "O tamanho do banner é obrigatório."}),
  isActive: z.boolean().default(true),
});

export default function EditPartnerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
    });
    
    useEffect(() => {
        const fetchPartner = async () => {
            setIsLoading(true);
            const partner = await getPartnerById(params.id);
            if (partner) {
                form.reset(partner);
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Parceiro não encontrado.' });
                router.push('/admin/marketing/partners');
            }
            setIsLoading(false);
        };
        fetchPartner();
    }, [params.id, form, toast, router]);

    const onSubmit = async (values: PartnerFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await updatePartner(params.id, values);
            if (result.success) {
                toast({ title: 'Parceiro Atualizado!', description: `O parceiro "${values.name}" foi salvo com sucesso.` });
                router.push('/admin/marketing/partners');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Atualizar',
                description: (error as Error).message || 'Não foi possível salvar as alterações.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Parceiro</h1>
                    <p className="text-muted-foreground">Ajuste os detalhes do parceiro/patrocinador.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Banner</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome do Parceiro</FormLabel><FormControl><Input {...field} placeholder="Ex: Seguradora XPTO" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>URL da Imagem do Banner</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormDescription>A imagem deve ser o banner final. Use um fundo transparente para melhor resultado.</FormDescription><FormMessage /></FormItem>
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
                                <div className="space-y-0.5"><FormLabel>Parceiro ativo?</FormLabel><FormDescription>Parceiros inativos não aparecem no site.</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                         )}/>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        </Form>
    );
}
