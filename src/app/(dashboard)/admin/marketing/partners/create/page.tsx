
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { createPartner } from '@/app/actions/marketing-actions';

const partnerFormSchema = z.object({
  name: z.string().min(3, "O nome do parceiro é obrigatório."),
  imageUrl: z.string().url("A URL da imagem é obrigatória e deve ser válida."),
  linkUrl: z.string().url("A URL de destino é obrigatória e deve ser válida."),
  size: z.enum(['small', 'medium', 'large'], { required_error: "O tamanho do banner é obrigatório."}),
  isActive: z.boolean().default(true),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function CreatePartnerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
        defaultValues: {
            name: '',
            imageUrl: '',
            linkUrl: '',
            size: 'medium',
            isActive: true,
        },
    });

    const onSubmit = async (values: PartnerFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createPartner(values);
            if (result.success) {
                toast({
                    title: 'Parceiro Criado com Sucesso!',
                    description: `O parceiro "${values.name}" foi salvo.`,
                });
                router.push('/admin/marketing/partners');
            } else {
                 toast({ variant: 'destructive', title: 'Erro ao Criar Parceiro', description: result.error });
            }
        } catch (error) {
            console.error("Error creating partner: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro Crítico',
                description: 'Não foi possível se comunicar com o servidor. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Adicionar Novo Parceiro</h1>
                    <p className="text-muted-foreground">Preencha os detalhes do parceiro/patrocinador para exibi-lo no site.</p>
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
                                <div className="space-y-0.5"><FormLabel>Ativar parceiro imediatamente?</FormLabel><FormDescription>Parceiros inativos não aparecem no site.</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                         )}/>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Parceiro
                    </Button>
                </div>
            </form>
        </Form>
    );
}
