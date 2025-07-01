
import { BlogPostForm } from './blog-post-form';

export default function CreateBlogPostPage() {
    return (
        <div className="flex flex-col gap-8">
             <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Criar Novo Post</h1>
                <p className="text-muted-foreground">Escreva uma nova notícia ou artigo para o blog.</p>
            </div>
            <BlogPostForm />
        </div>
    );
}
