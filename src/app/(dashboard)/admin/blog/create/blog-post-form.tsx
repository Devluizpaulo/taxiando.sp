
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { blogPostFormSchema, type BlogPostFormValues } from '@/lib/blog-schemas';
import { type BlogPost } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, Pen, Save, Sparkles, Link as LinkIcon, PlusCircle, Trash2 } from 'lucide-react';
import { createBlogPost, updateBlogPost } from '@/app/actions/blog-actions';
import { uploadFile } from '@/app/actions/storage-actions';
import { generateBlogPost, type GenerateBlogPostOutput } from '@/ai/flows/generate-blog-post-flow';


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

const AiAssistantCard = ({ onDetailsGenerated }: { onDetailsGenerated: (details: GenerateBlogPostOutput) => void }) => {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (topic.trim().length < 10) {
            toast({ variant: 'destructive', title: 'Tópico muito curto', description: 'Por favor, forneça mais detalhes sobre o que você quer escrever.' });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateBlogPost({ topic });
            onDetailsGenerated(result);
            toast({ title: "Conteúdo Gerado!", description: "O formulário foi preenchido com as informações da IA." });
        } catch (error) {
            console.error("AI generation error:", error);
            toast({ variant: 'destructive', title: 'Erro da IA', description: 'Não foi possível gerar o conteúdo do post.' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Assistente de IA</CardTitle>
                <CardDescription>Sem tempo para escrever? Dê um tópico e deixe a IA criar um rascunho completo para você.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Ex: Dicas para economizar combustível no trânsito de SP"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={2}
                />
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Gerar Post com IA
                </Button>
            </CardContent>
        </Card>
    );
}

const postCategories = ['Notícia', 'Artigo de Opinião', 'Dica Rápida', 'História de SP', 'Análise de Setor'];

export function BlogPostForm({ post }: { post?: BlogPost }) {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostFormSchema),
        defaultValues: {
            title: post?.title || '',
            slug: post?.slug || '',
            category: post?.category || '',
            excerpt: post?.excerpt || '',
            imageUrl: post?.imageUrl || '',
            content: post?.content || '',
            status: post?.status || 'Draft',
            source: post?.source || '',
            sourceUrl: post?.sourceUrl || '',
            relatedLinks: post?.relatedLinks || [],
        },
    });
    
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const watchedContent = form.watch('content');
    const watchedImageUrl = form.watch('imageUrl');

    const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
        control: form.control,
        name: "relatedLinks",
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue('title', e.target.value);
        if (!form.formState.dirtyFields.slug) {
            form.setValue('slug', slugify(e.target.value));
        }
    };
    
    const handleDetailsGenerated = (details: GenerateBlogPostOutput) => {
        form.setValue('title', details.title);
        form.setValue('slug', details.slug);
        form.setValue('excerpt', details.excerpt);
        form.setValue('content', details.content);
    };

    const onSubmit = async (values: BlogPostFormValues) => {
        setIsSubmitting(true);
        try {
            if (!user || !userProfile) {
                throw new Error('Usuário não autenticado.');
            }

            let finalImageUrl = values.imageUrl;

            if (values.imageFile) {
                toast({ title: "Fazendo upload da imagem...", description: "Aguarde um momento." });
                const formData = new FormData();
                formData.append('file', values.imageFile);
                const uploadResult = await uploadFile(formData, user.uid);

                if (uploadResult.success && uploadResult.url) {
                    finalImageUrl = uploadResult.url;
                } else {
                    throw new Error(uploadResult.error || 'Falha no upload da imagem.');
                }
            }
            
            if (!finalImageUrl) {
                 throw new Error('A imagem de capa é obrigatória.');
            }

            const { imageFile, ...dataToSave } = values;
            const finalValues = { ...dataToSave, imageUrl: finalImageUrl };

            const result = post
                ? await updateBlogPost(post.id, finalValues)
                : await createBlogPost(finalValues, user.uid, userProfile.name || "Admin");

            if (result.success) {
                toast({
                    title: post ? 'Post Atualizado!' : 'Post Criado!',
                    description: `O post "${values.title}" foi salvo com sucesso.`,
                });
                router.push('/admin/blog');
                router.refresh(); 
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
                        {!post && <AiAssistantCard onDetailsGenerated={handleDetailsGenerated} />}
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
                                 <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria</FormLabel>
                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {postCategories.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Links Relacionados (Opcional)</CardTitle>
                                <CardDescription>Adicione links externos que complementem seu post.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {linkFields.map((field, index) => (
                                    <div key={field.id} className="flex items-end gap-2 p-3 rounded-md bg-muted/50 border">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <FormField control={form.control} name={`relatedLinks.${index}.title`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Título do Link</FormLabel><FormControl><Input {...field} placeholder="Ex: Matéria Original" /></FormControl><FormMessage /></FormItem>)}/>
                                            <FormField control={form.control} name={`relatedLinks.${index}.url`} render={({ field }) => (<FormItem><FormLabel className="text-xs">URL</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>)}/>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9"><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendLink({ title: '', url: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Link</Button>
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
                                <div className="relative flex items-center justify-center text-sm text-muted-foreground before:flex-1 before:border-b before:border-border after:flex-1 after:border-b after:border-border">
                                    <span className="px-2">OU</span>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="imageFile"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Enviar Imagem do Computador</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="file" 
                                                    accept="image/*"
                                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        field.onChange(file);
                                                        if (file) {
                                                            if (previewUrl) URL.revokeObjectURL(previewUrl);
                                                            setPreviewUrl(URL.createObjectURL(file));
                                                        } else {
                                                            setPreviewUrl(null);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {(previewUrl || watchedImageUrl) && (
                                    <div className="mt-4">
                                        <Label>Preview da Imagem</Label>
                                        <div className="relative mt-2 aspect-video w-full">
                                            <Image 
                                                src={previewUrl || watchedImageUrl || ''} 
                                                alt="Preview da imagem de capa" 
                                                fill
                                                className="rounded-md border object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle>Fonte e Credibilidade</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                 <FormField control={form.control} name="source" render={({ field }) => (
                                    <FormItem><FormLabel>Fonte da Notícia (Opcional)</FormLabel><FormControl><Input {...field} placeholder="Ex: G1, Prefeitura de SP" /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="sourceUrl" render={({ field }) => (
                                    <FormItem><FormLabel>URL da Fonte (Opcional)</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save />}
                            {post ? 'Salvar Alterações' : 'Salvar Post'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
