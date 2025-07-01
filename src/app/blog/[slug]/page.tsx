
import { getBlogPostBySlug } from "@/app/actions/blog-actions";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export default async function BlogPostPage({ params }: { params: { slug: string }}) {
    const post = await getBlogPostBySlug(params.slug);

    if (!post) {
        notFound();
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1">
                <article className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
                    <div className="mb-8 text-center">
                        <Link href="/blog" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Voltar para todas as notícias</Link>
                        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
                        <p className="mt-4 text-muted-foreground">
                            Por {post.authorName} em {format(new Date(post.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={1200}
                        height={600}
                        className="w-full rounded-xl object-cover aspect-video mb-12"
                        priority
                        data-ai-hint="news article main image"
                    />

                    <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                    </div>
                </article>
            </main>
            <PublicFooter />
        </div>
    )
}
