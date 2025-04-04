import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog-data";
import { metadata } from "@/lib/Metadata/blog-metadata";

export { metadata };

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = getRelatedPosts(post.id);

  return (
    <div className="container mt-[8rem] lg:mt-[11rem] bg-muted/80 px-4 py-4 mx-auto">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/blog" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content - 3/4 width on desktop */}
        <main className="w-full lg:w-3/4 order-2 lg:order-1">
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <div className="mb-8">
              <Badge variant="outline" className="mb-4">
                {post.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>

            <div className="relative w-full h-[400px] mb-8">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 75vw"
                priority
              />
            </div>

            <div dangerouslySetInnerHTML={{ __html: post.content }} />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link href={`/blog?q=${encodeURIComponent(tag)}`} key={tag}>
                      <Badge variant="outline" className="cursor-pointer">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            <div className="flex items-center gap-4 mt-8">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={post.authorImage || "/placeholder.svg"}
                  alt={post.author}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <h3 className="font-semibold">{post.author}</h3>
                <p className="text-muted-foreground text-sm">
                  {post.authorBio}
                </p>
              </div>
            </div>
          </article>

          {/* JSON-LD structured data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: post.title,
                image: post.image,
                datePublished: post.date,
                dateModified: post.date,
                author: {
                  "@type": "Person",
                  name: post.author,
                },
                publisher: {
                  "@type": "Organization",
                  name: "TechTrove Electronics",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://techtrove.com/logo.png", // This would be a real logo in production
                  },
                },
                description: post.excerpt,
                keywords: post.tags?.join(", "),
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": `https://techtrove.com/blog/${post.slug}`,
                },
              }),
            }}
          />
        </main>

        {/* Sidebar - 1/4 width on desktop */}
        <aside className="w-full lg:w-1/4 space-y-8 order-1 lg:order-2">
          {/* Related Posts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
            <div className="space-y-4">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id}>
                  <div className="relative w-full h-32">
                    <Image
                      src={relatedPost.image || "/placeholder.svg"}
                      alt={relatedPost.title}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 25vw"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base line-clamp-2">
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:underline">
                        {relatedPost.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {relatedPost.excerpt}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set(relatedPosts.map((post) => post.category))].map(
                (category) => (
                  <Link
                    href={`/blog?q=${encodeURIComponent(category)}`}
                    key={category}>
                    <Badge variant="secondary" className="cursor-pointer">
                      {category}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest tech news and deals.
            </p>
            <Button className="w-full">Subscribe</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
