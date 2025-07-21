

import { getPublishedBlogPosts } from "@/app/actions/blog-actions";
import { BlogListClient } from "./blog-list-client";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default async function BlogAndGuidesPage() {
    const posts = await getPublishedBlogPosts();

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                 <BlogListClient initialPosts={posts} />
            </main>
            <PublicFooter />
        </div>
    );
}
