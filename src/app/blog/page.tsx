
import { getPublishedBlogPosts } from "@/app/actions/blog-actions";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPost } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoveRight, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


function BlogPostCard({ post }: { post: BlogPost }) {
    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
            <Link href={`/blog/${post.slug}`} className="block">
                <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full object-cover aspect-video" data-ai-hint="city street abstract"/>
            </Link>
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
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/blog/${post.slug}`}>Ler mais <MoveRight className="ml-2"/></Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default async function BlogListPage() {
    const posts = await getPublishedBlogPosts();

    return (
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
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map(post => (
                                <BlogPostCard key={post.id} post={post} />
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
    )
}
