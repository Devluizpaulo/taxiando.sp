'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const courseFormSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.' }),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  category: z.string().min(3, { message: 'A categoria é obrigatória.' }),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CreateCoursePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
        },
    });

    const onSubmit = async (values: CourseFormValues) => {
        setIsSubmitting(true);
        console.log('Creating course with values:', values);
        // Em um aplicativo real, aqui você faria a chamada para o Firebase para criar o curso.
        // ex: await addDoc(collection(db, "courses"), values);

        setTimeout(() => {
            toast({
                title: 'Curso Criado!',
                description: `O curso "${values.title}" foi adicionado com sucesso.`,
            });
            router.push('/admin/courses');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Criar Novo Curso</h1>
                <p className="text-muted-foreground">Preencha as informações básicas do curso.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações do Curso</CardTitle>
                    <CardDescription>Estes são os detalhes principais que os alunos verão no catálogo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título do Curso</FormLabel>
                                    <FormControl><Input {...field} placeholder="Ex: Direção Defensiva Avançada" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <FormControl><Input {...field} placeholder="Ex: Segurança, Atendimento, Legislação" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição Curta</FormLabel>
                                    <FormControl><Textarea {...field} placeholder="Descreva o objetivo principal do curso em poucas palavras." className="min-h-[120px]" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Curso
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
