
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/datepicker';
import { createCoupon, type CouponFormValues } from '@/app/actions/marketing-actions';
import { couponFormSchema } from '@/lib/marketing-schemas';

export default function CreateCouponPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponFormSchema),
        defaultValues: {
            code: '',
            discountType: 'percentage',
            isActive: true,
        },
    });

    const onSubmit = async (values: CouponFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createCoupon(values);
            if (result.success) {
                toast({
                    title: 'Cupom Criado com Sucesso!',
                    description: `O cupom "${values.code}" foi salvo.`,
                });
                router.push('/admin/marketing/coupons');
            } else {
                 toast({ variant: 'destructive', title: 'Erro ao Criar Cupom', description: result.error });
            }
        } catch (error) {
            console.error("Error creating coupon: ", error);
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
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Criar Cupom de Desconto</h1>
                    <p className="text-muted-foreground">Defina os detalhes do novo cupom para os pacotes de crédito.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Cupom</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="code" render={({ field }) => (
                            <FormItem><FormLabel>Código do Cupom</FormLabel><FormControl><Input {...field} placeholder="EX: BEMVINDO10" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="discountType" render={({ field }) => (
                                <FormItem><FormLabel>Tipo de Desconto</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="discountValue" render={({ field }) => (
                                <FormItem><FormLabel>Valor do Desconto</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="maxUses" render={({ field }) => (
                                <FormItem><FormLabel>Limite de Usos (Opcional)</FormLabel><FormControl><Input type="number" {...field} placeholder="Ex: 100" /></FormControl><FormDescription>Deixe em branco para usos ilimitados.</FormDescription><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="expiresAt" render={({ field }) => (
                                <FormItem><FormLabel>Data de Expiração (Opcional)</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormDescription>Deixe em branco se não expirar.</FormDescription><FormMessage /></FormItem>
                            )}/>
                        </div>
                         
                         <FormField control={form.control} name="isActive" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5"><FormLabel>Ativar cupom imediatamente?</FormLabel><FormDescription>Cupons inativos não podem ser usados.</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                         )}/>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Cupom
                    </Button>
                </div>
            </form>
        </Form>
    );
}
