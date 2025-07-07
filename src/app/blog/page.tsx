

import { getPublishedBlogPosts } from "@/app/actions/blog-actions";
import { getTips } from "@/app/actions/city-guide-actions";
import { BlogListClient } from "./blog-list-client";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default async function BlogAndGuidesPage() {
    const [posts, tips] = await Promise.all([
        getPublishedBlogPosts(),
        getTips(),
    ]);

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <PublicHeader />
            <main className="flex-1">
                 <BlogListClient initialPosts={posts} initialTips={tips} />
            </main>
            <PublicFooter />
        </div>
    );
}
