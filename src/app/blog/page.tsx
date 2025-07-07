

import { getPublishedBlogPosts } from "@/app/actions/blog-actions";
import { BlogListClient } from "./blog-list-client";

export default async function BlogListPage() {
    const posts = await getPublishedBlogPosts();

    return <BlogListClient initialPosts={posts} />;
}
