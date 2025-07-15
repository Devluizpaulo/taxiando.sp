
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createCourse } from '@/app/actions/course-actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const courseShellFormSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres.' }),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres.' }),
  category: z.string().min(3, { message: 'A categoria é obrigatória.' }),
});

type CourseShellFormValues = z.infer<typeof courseShellFormSchema>;

export default function CreateCoursePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CourseShellFormValues>({
        resolver: zodResolver(courseShellFormSchema),
        defaultValues: { title: '', description: '', category: '' },
    });

    const onSubmit = async (values: CourseShellFormValues) => {
        setIsSubmitting(true);
        try {
            const result = await createCourse(values);

            if (result.success && result.courseId) {
                toast({ title: 'Curso Criado com Sucesso!', description: 'Agora adicione os módulos e aulas.' });
                router.push(`/admin/courses/${result.courseId}/edit`);
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error("Error creating course shell: ", error);
            toast({ variant: 'destructive', title: 'Erro ao Criar Curso', description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Criar Novo Curso (Etapa 1 de 2)</h1>
                    <p className="text-muted-foreground">Comece com as informações básicas. Você adicionará o conteúdo na próxima etapa.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informações Gerais do Curso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Título do Curso</FormLabel><FormControl><Input {...field} placeholder="Ex: Direção Defensiva Avançada" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} placeholder="Ex: Segurança, Atendimento" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descrição Curta</FormLabel><FormControl><Textarea {...field} placeholder="Descreva o objetivo principal do curso." /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>

                <div className="flex justify-end items-center mt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar e ir para o Construtor
                    </Button>
                </div>
            </form>
        </Form>
    );
}
