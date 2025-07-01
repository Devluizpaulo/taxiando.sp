
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { blogPostFormSchema, type BlogPostFormValues } from '@/lib/blog-schemas';
import { type BlogPost } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, Pen, Save } from 'lucide-react';
import { createBlogPost, updateBlogPost } from '@/app/actions/blog-actions';

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

export function BlogPostForm({ post }: { post?: BlogPost }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostFormSchema),
        defaultValues: {
            title: post?.title || '',
            slug: post?.slug || '',
            excerpt: post?.excerpt || '',
            imageUrl: post?.imageUrl || '',
            content: post?.content || '',
            status: post?.status || 'Draft',
        },
    });

    const watchedContent = form.watch('content');
    const watchedTitle = form.watch('title');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue('title', e.target.value);
        if (!form.formState.dirtyFields.slug) {
            form.setValue('slug', slugify(e.target.value));
        }
    };

    const onSubmit = async (values: BlogPostFormValues) => {
        setIsSubmitting(true);
        try {
            const result = post
                ? await updateBlogPost(post.id, values)
                : await createBlogPost(values);

            if (result.success) {
                toast({
                    title: post ? 'Post Atualizado!' : 'Post Criado!',
                    description: `O post "${values.title}" foi salvo com sucesso.`,
                });
                router.push('/admin/blog');
                router.refresh(); // Refresh server components
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: (error as Error).message || 'Não foi possível salvar o post.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                             <CardHeader>
                                <CardTitle>Informações Principais</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título do Post</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: Novas Regras para Apps em São Paulo" onChange={handleTitleChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="slug" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug (URL amigável)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ex: novas-regras-apps-sp" />
                                        </FormControl>
                                        <FormDescription>Será usado na URL do post. Use apenas letras minúsculas, números e hífens.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="excerpt" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resumo (Excerpt)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Um resumo curto do post para a listagem." rows={3}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Conteúdo do Post</CardTitle></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="edit" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="edit"><Pen className="mr-2"/> Editar</TabsTrigger>
                                        <TabsTrigger value="preview"><Eye className="mr-2"/> Preview</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="edit" className="mt-4">
                                        <FormField control={form.control} name="content" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">Conteúdo (suporta Markdown)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Escreva sua matéria aqui..." rows={20} />
                                                </FormControl>
                                                <FormDescription>Dica: Use `#` para títulos, `**negrito**` para ênfase, e `-` para listas.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </TabsContent>
                                    <TabsContent value="preview" className="mt-4">
                                        <div className="prose dark:prose-invert max-w-none rounded-md border p-4 min-h-[480px]">
                                            {watchedContent ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{watchedContent}</ReactMarkdown>
                                            ) : (
                                                <p className="text-muted-foreground">A pré-visualização do seu post aparecerá aqui.</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8 sticky top-20">
                         <Card>
                            <CardHeader><CardTitle>Publicação</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Published">Publicado</SelectItem>
                                                <SelectItem value="Draft">Rascunho</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Posts em rascunho não são visíveis publicamente.</FormDescription>
                                    <FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL da Imagem de Capa</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                            <CardContent>
                                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save />}
                                    {post ? 'Salvar Alterações' : 'Salvar Post'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}

