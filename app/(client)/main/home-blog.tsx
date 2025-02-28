import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomeBlogSection() {
  // This would typically come from a CMS or API
  const featuredPosts = [
    {
      id: 1,
      title: "The Future of Smart Home Technology",
      excerpt:
        "Discover how the latest smart home devices are revolutionizing everyday living.",
      date: "May 15, 2024",
      author: "Alex Johnson",
      category: "Smart Home",
      image: "/placeholder.jpg",
      slug: "future-of-smart-home-technology",
    },
    {
      id: 2,
      title: "Top 5 Wireless Earbuds for 2024",
      excerpt:
        "We compare the best wireless earbuds on the market to help you find your perfect match.",
      date: "May 10, 2024",
      author: "Sarah Chen",
      category: "Audio",
      image: "/placeholder.jpg",
      slug: "top-5-wireless-earbuds-2024",
    },
    {
      id: 3,
      title: "How to Choose the Right Gaming Monitor",
      excerpt:
        "Resolution, refresh rate, response time - we break down what really matters.",
      date: "May 5, 2024",
      author: "Marcus Williams",
      category: "Gaming",
      image: "/placeholder.jpg",
      slug: "choose-right-gaming-monitor",
    },
  ];

  return (
    <div className="mx-auto py-8 max-w-9xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Latest from our Blog
          </h2>
          <p className="text-muted-foreground mt-2">
            Stay updated with the latest tech trends and product reviews
          </p>
        </div>
        <Button asChild variant="ghost" className="mt-4 md:mt-0">
          <Link href="/blog" className="flex items-center">
            View all posts <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredPosts.map((post) => (
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
                <span>{post.category}</span>
                <span className="mx-2">•</span>
                <span>{post.date}</span>
              </div>
              <CardTitle className="line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-3 mt-2">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t pt-4">
              <div className="text-sm">By {post.author}</div>
              <Button asChild variant="ghost" size="sm" className="ml-auto">
                <Link href={`/blog/${post.slug}`}>Read more</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
