import dynamic from "next/dynamic";

import { blogPosts, searchPosts } from "@/lib/blog-data";
import { metadata } from "@/lib/Metadata/blog-metadata";

export { metadata };

const BlogLayout = dynamic(() => import("@/components/Blog/blog-layout"));

export default function BlogPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  return (
    <BlogLayout query={query} posts={query ? searchPosts(query) : blogPosts} />
  );
}
