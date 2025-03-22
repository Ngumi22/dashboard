import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  blogPosts,
  getAllCategories,
  getFeaturedPosts,
  searchPosts,
  getAllTags,
} from "@/lib/blog-data";
import BlogSearch from "../main/blog-search";

export const metadata: Metadata = {
  title: "Blog | Bernzz Digital Solutions",
  description:
    "Latest news, reviews, and insights about electronics and technology from TechTrove - your trusted source for tech information and product reviews.",
  keywords:
    "electronics blog, tech reviews, gadget news, technology insights, product comparisons",
  openGraph: {
    title: "Bernzz Digital Solutions Blog",
    description:
      "Stay updated with the latest tech news, product reviews, and buying guides from Bernzz Digital Solutions.",
    url: "https://www.bernzzdigitalsolutions.co.ke",
    siteName: "Bernzz Digital Solutions",
    images: [
      {
        url: "https://www.bernzzdigitalsolutions.co.ke/opengraph-image.png", // This would be a real image in production
        width: 1200,
        height: 630,
        alt: "Bernzz Digital Solutions Blog",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bernzz Digital Solutions Blog",
    description:
      "Stay updated with the latest tech news, product reviews, and buying guides from Bernzz Digital Solutions.",
    images: ["https://www.bernzzdigitalsolutions.co.ke/opengraph-image.png"], // This would be a real image in production
  },
  alternates: {
    canonical: "https://www.bernzzdigitalsolutions.co.ke",
  },
};

export default function BlogPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const displayedPosts = query ? searchPosts(query) : blogPosts;

  // Get featured posts for the sidebar
  const featuredPosts = getFeaturedPosts();

  // Get all categories and tags for the sidebar
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="container px-4 py-12 mx-auto">
      <h1 className="text-2xl font-bold mb-8">Bernzz Digital Solutions Blog</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - 1/4 width on desktop */}
        <aside className="w-full lg:w-1/4 space-y-8">
          {/* Search */}
          <div className="relative">
            <BlogSearch />
          </div>

          {/* Featured Posts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Featured Articles</h3>
            <div className="space-y-4">
              {featuredPosts.map((post) => (
                <div key={post.id} className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 64px, 64px"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium line-clamp-2 text-sm">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline">
                        {post.title}
                      </Link>
                    </h4>
                    <p className="text-xs text-muted-foreground">{post.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  href={`/blog?q=${encodeURIComponent(category)}`}
                  key={category}>
                  <Badge variant="secondary" className="cursor-pointer">
                    {category}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link href={`/blog?q=${encodeURIComponent(tag)}`} key={tag}>
                  <Badge variant="outline" className="cursor-pointer">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest tech news and deals.
            </p>
            <div className="space-y-2">
              <Input placeholder="Your email" type="email" />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </aside>

        {/* Main Content - 3/4 width on desktop */}
        <main className="w-full lg:w-3/4">
          {query && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Search results for:{" "}
                <span className="text-primary">{query}</span>
              </h2>
              <p className="text-muted-foreground">
                Found {displayedPosts.length}{" "}
                {displayedPosts.length === 1 ? "result" : "results"}
              </p>
            </div>
          )}

          {displayedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedPosts.map((post) => (
                <Card key={post.id} className="flex flex-col h-full">
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="mx-2">•</span>
                      <span>{post.date}</span>
                    </div>
                    <CardTitle className="line-clamp-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3 mt-2">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t pt-4">
                    <div className="text-sm">By {post.author}</div>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="ml-auto">
                      <Link href={`/blog/${post.slug}`}>Read more</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                We couldnt find any posts matching your search. Try different
                keywords or browse our categories.
              </p>
              <Button asChild variant="outline">
                <Link href="/blog">View all posts</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
