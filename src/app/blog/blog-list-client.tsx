
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { type BlogPost, type CityTip } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Newspaper, BookHeart, Compass } from "lucide-react";
import { ShareButtons } from '@/components/share-buttons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CityTipCard } from '@/components/city-tip-card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function BlogPostCard({ post }: { post: BlogPost }) {
    const [isOpen, setIsOpen] = useState(false);
    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : '';

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer" onClick={() => setIsOpen(true)}>
                    <div className="relative">
                        <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="city street abstract"/>
                         <Badge variant="secondary" className="absolute top-2 left-2">{post.category}</Badge>
                    </div>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl line-clamp-2">{post.title}</CardTitle>
                        <CardDescription>
                            Por {post.authorName} em {format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
                            Por {post.authorName} em {format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 space-y-4">
                        <div className="relative w-full aspect-video">
                            <Image src={post.imageUrl} alt={post.title} fill className="rounded-md object-cover" />
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>
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


export function BlogListClient({ initialPosts, initialTips }: { initialPosts: BlogPost[], initialTips: CityTip[] }) {
    const [postCategoryFilter, setPostCategoryFilter] = useState('Todas');
    
    const postCategories = useMemo(() => ['Todas', ...Array.from(new Set(initialPosts.map(p => p.category)))], [initialPosts]);

    const filteredPosts = useMemo(() => {
        if (postCategoryFilter === 'Todas') return initialPosts;
        return initialPosts.filter(p => p.category === postCategoryFilter);
    }, [initialPosts, postCategoryFilter]);

    const driverTips = useMemo(() => initialTips.filter(t => t.target === 'driver'), [initialTips]);
    const clientTips = useMemo(() => initialTips.filter(t => t.target === 'client'), [initialTips]);


    return (
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
            <div className="mb-12 text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Guias & Notícias</h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Fique por dentro de tudo que acontece no mundo do transporte em São Paulo e explore as melhores dicas da cidade.
                </p>
            </div>

            <Tabs defaultValue="blog" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="blog"><Newspaper className="mr-2"/>Blog & Notícias</TabsTrigger>
                    <TabsTrigger value="guides"><Compass className="mr-2"/>Guias da Cidade</TabsTrigger>
                </TabsList>
                
                <TabsContent value="blog" className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtros do Blog</CardTitle>
                            <CardDescription>Filtre por categoria para encontrar o que mais te interessa.</CardDescription>
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
                </TabsContent>

                <TabsContent value="guides" className="mt-8">
                    <Tabs defaultValue="driver_tips" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                             <TabsTrigger value="driver_tips">Para Motoristas</TabsTrigger>
                             <TabsTrigger value="client_tips">Para Passageiros</TabsTrigger>
                        </TabsList>
                        <TabsContent value="driver_tips" className="mt-6">
                            {driverTips.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {driverTips.map(tip => <CityTipCard key={tip.id} tip={tip} />)}
                                </div>
                            ) : (
                                 <Card className="py-16 text-center">
                                    <CardHeader>
                                        <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <CardTitle>Nenhuma Dica Cadastrada</CardTitle>
                                        <CardDescription>Estamos preparando as melhores dicas para você. Volte em breve!</CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                        </TabsContent>
                        <TabsContent value="client_tips" className="mt-6">
                            {clientTips.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {clientTips.map(tip => <CityTipCard key={tip.id} tip={tip} />)}
                                </div>
                            ) : (
                                 <Card className="py-16 text-center">
                                    <CardHeader>
                                        <Compass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <CardTitle>Nenhuma Dica Cadastrada</CardTitle>
                                        <CardDescription>Estamos preparando as melhores sugestões para seus clientes. Volte em breve!</CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </TabsContent>
            </Tabs>
        </div>
    )
}
