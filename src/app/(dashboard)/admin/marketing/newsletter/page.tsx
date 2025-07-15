
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Eye } from 'lucide-react';
import { sendNewsletter } from '@/app/actions/marketing-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const newsletterSchema = z.object({
  subject: z.string().min(5, "O assunto é obrigatório."),
  content: z.string().min(50, "O conteúdo deve ter pelo menos 50 caracteres."),
  targetAudience: z.enum(['all', 'drivers', 'fleets', 'providers'], { required_error: "Selecione o público."}),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<NewsletterFormValues>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            subject: '',
            content: '',
            targetAudience: 'all',
        },
    });

    const watchedContent = form.watch('content');

    const onSubmit = async (values: NewsletterFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await sendNewsletter(values);
            if (result.success) {
                toast({
                    title: 'Newsletter Enviada!',
                    description: result.message,
                });
                form.reset();
            } else {
                 toast({ variant: 'destructive', title: 'Erro ao Enviar', description: result.error });
            }
        } catch (error) {
            console.error("Error sending newsletter: ", error);
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
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Criador de Newsletter</h1>
                    <p className="text-muted-foreground">Crie e envie emails para engajar sua base de usuários.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Conteúdo do Email</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="targetAudience" render={({ field }) => (
                                <FormItem><FormLabel>Público-Alvo</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os Usuários</SelectItem>
                                            <SelectItem value="drivers">Apenas Motoristas</SelectItem>
                                            <SelectItem value="fleets">Apenas Frotas</SelectItem>
                                            <SelectItem value="providers">Apenas Prestadores</SelectItem>
                                        </SelectContent>
                                    </Select>
                                <FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem><FormLabel>Assunto do Email</FormLabel><FormControl><Input {...field} placeholder="Ex: As novidades da semana na Táxiando SP!" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            
                            <Tabs defaultValue="edit" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="edit">Editar</TabsTrigger>
                                    <TabsTrigger value="preview"><Eye className="mr-2"/> Preview</TabsTrigger>
                                </TabsList>
                                <TabsContent value="edit" className="mt-4">
                                     <FormField control={form.control} name="content" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Conteúdo (suporta Markdown)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    placeholder="Escreva sua mensagem aqui. Use Markdown para formatar títulos, listas, etc."
                                                    rows={15}
                                                />
                                            </FormControl>
                                            <FormDescription>Use `# Título` para títulos, `*itálico*` ou `**negrito**` para ênfase, e `-` para listas.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </TabsContent>
                                <TabsContent value="preview" className="mt-4">
                                     <div className="prose dark:prose-invert max-w-none rounded-md border p-4 min-h-[365px]">
                                        {watchedContent ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{watchedContent}</ReactMarkdown>
                                        ) : (
                                            <p className="text-muted-foreground">A pré-visualização do seu email aparecerá aqui.</p>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="sticky top-20">
                         <Card>
                            <CardHeader>
                                <CardTitle>Envio</CardTitle>
                                <CardDescription>Quando estiver pronto, revise o público e o conteúdo antes de enviar.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send />}
                                    {isSubmitting ? 'Enviando...' : 'Enviar Newsletter'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
