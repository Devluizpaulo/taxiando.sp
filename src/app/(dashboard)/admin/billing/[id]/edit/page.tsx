
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { getCreditPackageById, updateCreditPackage } from '@/app/actions/billing-actions';
import { packageFormSchema, type PackageFormValues } from '@/lib/billing-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { LoadingScreen } from '@/components/loading-screen';


export default function EditPackagePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageFormSchema),
    });

    useEffect(() => {
        const fetchPackage = async () => {
            setIsLoading(true);
            const pkg = await getCreditPackageById(params.id);
            if (pkg) {
                form.reset(pkg);
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Pacote não encontrado.' });
                router.push('/admin/billing');
            }
            setIsLoading(false);
        };
        fetchPackage();
    }, [params.id, form, toast, router]);

    const onSubmit = async (values: PackageFormValues) => {
        setIsSubmitting(true);
        const result = await updateCreditPackage(params.id, values);

        if (result.success) {
            toast({ title: 'Pacote Atualizado!', description: `O pacote "${values.name}" foi salvo com sucesso.` });
            router.push('/admin/billing');
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro ao Atualizar',
                description: result.error || 'Não foi possível salvar as alterações.',
            });
        }
        setIsSubmitting(false);
    };
    
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Pacote de Créditos</h1>
                    <p className="text-muted-foreground">Ajuste os detalhes do pacote de créditos.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Pacote</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome do Pacote</FormLabel><FormControl><Input {...field} placeholder="Ex: Pacote Básico" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} placeholder="Descreva os benefícios ou o uso ideal para este pacote." /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="credits" render={({ field }) => (
                                <FormItem><FormLabel>Quantidade de Créditos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <FormField control={form.control} name="priceId" render={({ field }) => (
                            <FormItem><FormLabel>ID do Preço (Mercado Pago)</FormLabel><FormControl><Input {...field} placeholder="price_..." /></FormControl><FormDescription>Este ID é usado para o checkout com o Mercado Pago.</FormDescription><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="popular" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5"><FormLabel>Marcar como "Mais Popular"?</FormLabel><FormDescription>Isso destacará o pacote na página de compra.</FormDescription></div>
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
