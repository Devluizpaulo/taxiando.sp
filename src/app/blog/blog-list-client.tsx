
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { type BlogPost } from "@/lib/types";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Newspaper } from "lucide-react";
import { ShareButtons } from '@/components/share-buttons';


function BlogPostCard({ post, onReadMore }: { post: BlogPost, onReadMore: () => void }) {
    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer" onClick={onReadMore}>
            <div className="relative">
                <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="city street abstract"/>
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
    );
}


export function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

    const postUrl = selectedPost ? `${window.location.origin}/blog/${selectedPost.slug}` : '';

    return (
        <Dialog open={!!selectedPost} onOpenChange={(isOpen) => !isOpen && setSelectedPost(null)}>
            <div className="flex min-h-screen flex-col bg-muted/40">
                <PublicHeader />
                <main className="flex-1">
                    <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
                        <div className="mb-12 text-center">
                            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">Blog e Notícias</h1>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                                Fique por dentro de tudo que acontece no mundo do transporte em São Paulo.
                            </p>
                        </div>
                        {initialPosts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {initialPosts.map(post => (
                                    <BlogPostCard key={post.id} post={post} onReadMore={() => setSelectedPost(post)} />
                                ))}
                            </div>
                        ) : (
                             <Card className="py-16 text-center">
                                <CardHeader>
                                    <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <CardTitle>Nenhuma notícia publicada</CardTitle>
                                    <CardDescription>Ainda não há notícias ou artigos. Volte em breve!</CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                    </div>
                </main>
                <PublicFooter />
            </div>

            {selectedPost && (
                <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-2">
                         <DialogTitle className="font-headline text-2xl">{selectedPost.title}</DialogTitle>
                         <DialogDescription>
                            Por {selectedPost.authorName} em {format(new Date(selectedPost.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 space-y-4">
                        <div className="relative w-full aspect-video">
                            <Image src={selectedPost.imageUrl} alt={selectedPost.title} fill className="rounded-md object-cover" />
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {selectedPost.content}
                            </ReactMarkdown>
                        </div>
                        {selectedPost.source && (
                            <div className="text-sm text-muted-foreground border-t pt-4">
                                <strong>Fonte: </strong> 
                                {selectedPost.sourceUrl ? (
                                    <a href={selectedPost.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                        {selectedPost.source}
                                    </a>
                                ) : (
                                    selectedPost.source
                                )}
                            </div>
                        )}
                    </div>
                     <DialogFooter className="p-6 pt-4 border-t flex-col sm:flex-row items-center sm:justify-between w-full">
                        <ShareButtons title={selectedPost.title} url={postUrl} />
                        <Button asChild variant="outline">
                            <Link href={`/blog/${selectedPost.slug}`}>Abrir em nova página</Link>
                        </Button>
                     </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    )
}
