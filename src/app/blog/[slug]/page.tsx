
import { getBlogPostBySlug } from "@/app/actions/blog-actions";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { headers } from 'next/headers';
import { ShareButtons } from "@/components/share-buttons";
import { Link as LinkIcon } from "lucide-react";
import { toDate } from '@/lib/date-utils';


export default async function BlogPostPage({ params }: { params: { slug: string }}) {
    const post = await getBlogPostBySlug(params.slug);

    if (!post) {
        notFound();
    }
    
    const headersList = await headers();
    const domain = headersList.get('x-forwarded-host') || headersList.get('host') || "localhost:9002";
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const postUrl = `${protocol}://${domain}/blog/${post.slug}`;
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1">
                <article className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
                    <div className="mb-8 text-center">
                        <Link href="/blog" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Voltar para todas as notícias</Link>
                        <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
                        <p className="mt-4 text-muted-foreground">
                            Por {post.authorName} em {format(toDate(post.createdAt) ?? new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>
                    <Image
                        src={post.imageUrls?.[0] || 'https://placehold.co/600x400.png'}
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
                    
                    {post.relatedLinks && post.relatedLinks.length > 0 && (
                        <div className="mt-12 pt-8 border-t">
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


                    <div className="mt-12 border-t pt-8">
                        <ShareButtons title={post.title} url={postUrl} />
                    </div>
                </article>
            </main>
            <PublicFooter />
        </div>
    )
}
