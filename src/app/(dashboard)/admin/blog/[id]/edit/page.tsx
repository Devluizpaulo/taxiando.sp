
'use client';

import { useEffect, useState } from 'react';
import { getBlogPostById } from '@/app/actions/blog-actions';
import { BlogPostForm } from '../../create/blog-post-form';
import { LoadingScreen } from '@/components/loading-screen';
import { type BlogPost } from '@/lib/types';

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const fetchedPost = await getBlogPostById(params.id);
            setPost(fetchedPost);
            setLoading(false);
        };
        fetchPost();
    }, [params.id]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!post) {
        return (
             <div className="flex flex-col gap-8 items-center justify-center h-full">
                <h1 className="font-headline text-3xl font-bold tracking-tight">Post não encontrado</h1>
                <p className="text-muted-foreground">O post que você está tentando editar não existe ou foi removido.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Editar Post</h1>
                <p className="text-muted-foreground">Ajuste os detalhes do seu post.</p>
            </div>
            <BlogPostForm post={post} />
        </div>
    );
}
