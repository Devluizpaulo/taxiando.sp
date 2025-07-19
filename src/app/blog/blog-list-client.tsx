
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { type BlogPost } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Newspaper, Link as LinkIcon } from "lucide-react";
import { ShareButtons } from '@/components/share-buttons';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toDate } from '@/lib/date-utils';

function BlogPostCard({ post }: { post: BlogPost }) {
    const [isOpen, setIsOpen] = useState(false);
    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : '';

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer" onClick={() => setIsOpen(true)}>
                    <div className="relative">
                        <Image src={post.imageUrls?.[0] || 'https://placehold.co/600x400.png'} alt={post.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="city street abstract"/>
                         <Badge variant="secondary" className="absolute top-2 left-2">{post.category}</Badge>
                    </div>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl line-clamp-2">{post.title}</CardTitle>
                        <CardDescription>
                            Por {post.authorName} em {format(toDate(post.createdAt) ?? new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    </CardContent>
                    <CardFooter>
                        <span className="text-sm font-semibold text-primary w-full text-center">Ler mais...</span>
                    </CardFooter>
                </Card>
            </DialogTrigger>
             <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-2">
                         <DialogTitle className="font-headline text-2xl">{post.title}</DialogTitle>
                         <DialogDescription>
                            Por {post.authorName} em {format(toDate(post.createdAt) ?? new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 space-y-4">
                        <div className="relative w-full aspect-video">
                            <Image src={post.imageUrls?.[0] || 'https://placehold.co/600x400.png'} alt={post.title} fill className="rounded-md object-cover" />
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>
                         {post.relatedLinks && post.relatedLinks.length > 0 && (
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
                                    <LinkIcon className="h-5 w-5" /> Links Relacionados
                                </h3>
                                <ul className="space-y-2 list-disc pl-5">
                                    {post.relatedLinks.map((link, index) => (
                                        <li key={index}>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {post.source && (
                            <div className="text-sm text-muted-foreground border-t pt-4">
                                <strong>Fonte: </strong> 
                                {post.sourceUrl ? (
                                    <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                        {post.source}
                                    </a>
                                ) : (
                                    post.source
                                )}
                            </div>
                        )}
                    </div>
                     <DialogFooter className="p-6 pt-4 border-t flex-col sm:flex-row items-center sm:justify-between w-full">
                        <ShareButtons title={post.title} url={postUrl} />
                        <Button asChild variant="outline">
                            <Link href={`/blog/${post.slug}`}>Abrir em nova página</Link>
                        </Button>
                     </DialogFooter>
                </DialogContent>
        </Dialog>
    );
}


export function BlogListClient({ initialPosts }: { initialPosts: BlogPost[]}) {
    const [postCategoryFilter, setPostCategoryFilter] = useState('Todas');
    
    const postCategories = useMemo(() => ['Todas', ...Array.from(new Set(initialPosts.map(p => p.category)))], [initialPosts]);

    const filteredPosts = useMemo(() => {
        if (postCategoryFilter === 'Todas') return initialPosts;
        return initialPosts.filter(p => p.category === postCategoryFilter);
    }, [initialPosts, postCategoryFilter]);

    return (
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
            <div className="mb-12 text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Blog & Notícias</h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Fique por dentro de tudo que acontece no mundo do transporte em São Paulo.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Filtre por Categoria</CardTitle>
                    <div className="pt-4">
                         <Select value={postCategoryFilter} onValueChange={setPostCategoryFilter}>
                            <SelectTrigger className="w-full md:w-[280px]">
                                <SelectValue placeholder="Filtrar por categoria..." />
                            </SelectTrigger>
                            <SelectContent>
                                {postCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                     {filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPosts.map(post => (
                                <BlogPostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <Card className="py-16 text-center">
                            <CardHeader>
                                <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <CardTitle>Nenhum post encontrado</CardTitle>
                                <CardDescription>Não há posts nesta categoria ainda. Tente outro filtro.</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
