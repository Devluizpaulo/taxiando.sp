
import { getBlogPostById } from '@/app/actions/blog-actions';
import { BlogPostForm } from '../create/blog-post-form';
import { notFound } from 'next/navigation';

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
    const post = await getBlogPostById(params.id);

    if (!post) {
        notFound();
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
