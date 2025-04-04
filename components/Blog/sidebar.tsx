import dynamic from "next/dynamic";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  getFeaturedPosts,
  getAllCategories,
  getAllTags,
  BlogPost,
} from "@/lib/blog-data";
import BlogSearch from "./blog-search";

export default function Sidebar() {
  const featuredPosts = getFeaturedPosts().slice(0, 2);
  const categories = getAllCategories();
  const tags = getAllTags().slice(0, 10);

  return (
    <aside className="w-full lg:w-1/4 space-y-8">
      <div className="relative">
        <BlogSearch />
      </div>

      <FeaturedPosts posts={featuredPosts} />
      <CategoryList categories={categories} />
      <TagList tags={tags} />
      <NewsletterSignup />
    </aside>
  );
}

function FeaturedPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Featured Articles</h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="flex gap-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover rounded-md"
                sizes="64px"
              />
            </div>
            <div>
              <h4 className="font-medium line-clamp-2 text-sm">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h4>
              <p className="text-xs text-muted-foreground">{post.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryList({ categories }: { categories: string[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link href={`/blog?q=${encodeURIComponent(category)}`} key={category}>
            <Badge variant="secondary">{category}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link href={`/blog?q=${encodeURIComponent(tag)}`} key={tag}>
            <Badge variant="outline">{tag}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NewsletterSignup() {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
      <div className="space-y-2">
        <Input placeholder="Your email" type="email" />
        <Button className="w-full">Subscribe</Button>
      </div>
    </div>
  );
}
