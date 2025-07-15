
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { bookFormSchema, type BookFormValues } from '@/lib/library-schemas';
import { type LibraryBook } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { createOrUpdateBook } from '@/app/actions/library-actions';


export function BookForm({ book }: { book?: LibraryBook }) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(book?.coverImageUrl || null);
    const [pdfFileName, setPdfFileName] = useState<string | null>(book?.pdfUrl ? 'Arquivo PDF existente' : null);

    const form = useForm<BookFormValues>({
        resolver: zodResolver(bookFormSchema),
        defaultValues: {
            title: book?.title || '',
            author: book?.author || '',
            category: book?.category || '',
            description: book?.description || '',
            coverImageUrl: book?.coverImageUrl || '',
            pdfUrl: book?.pdfUrl || '',
        },
    });

    const onSubmit = async (values: BookFormValues) => {
        setIsSubmitting(true);
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createOrUpdateBook(values, user.uid, book?.id);

            if (result.success) {
                toast({
                    title: book ? 'Livro Atualizado!' : 'Livro Adicionado!',
                    description: `O livro "${values.title}" foi salvo com sucesso.`,
                });
                router.push('/admin/library');
                router.refresh(); 
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: (error as Error).message || 'Não foi possível salvar o livro.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Livro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} placeholder="O Poder do Hábito" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="author" render={({ field }) => (
                                <FormItem><FormLabel>Autor</FormLabel><FormControl><Input {...field} placeholder="Charles Duhigg" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input {...field} placeholder="Desenvolvimento Pessoal" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} placeholder="Um resumo sobre o livro." rows={4}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                             <div className="space-y-4">
                                <FormField control={form.control} name="coverFile" render={({ field }) => (
                                    <FormItem><FormLabel>Capa do Livro</FormLabel>
                                        <FormControl><Input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            field.onChange(file);
                                            setCoverPreview(file ? URL.createObjectURL(file) : null);
                                        }}/></FormControl>
                                    <FormMessage /></FormItem>
                                )}/>
                                {coverPreview && <Image src={coverPreview} alt="Preview da capa" width={150} height={225} className="rounded-md border object-cover shadow-md" />}
                            </div>
                            <div className="space-y-4">
                                <FormField control={form.control} name="pdfFile" render={({ field }) => (
                                    <FormItem><FormLabel>Arquivo PDF</FormLabel>
                                        <FormControl><Input type="file" accept="application/pdf" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            field.onChange(file);
                                            setPdfFileName(file ? file.name : null);
                                        }}/></FormControl>
                                    <FormMessage /></FormItem>
                                )}/>
                                {pdfFileName && <FormDescription>Arquivo selecionado: {pdfFileName}</FormDescription>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save /> {book ? 'Salvar Alterações' : 'Adicionar Livro'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
