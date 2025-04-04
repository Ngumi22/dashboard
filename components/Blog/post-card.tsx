import Link from "next/link";
import Image from "next/image";

export default function PostCard({ post }: { post: any }) {
  return (
    <article className="border rounded-lg overflow-hidden bg-background">
      <div className="relative aspect-video">
        <Image
          src={post.image || "/placeholder.svg"}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      </div>
      <div className="p-4">
        <div className="flex gap-2 items-center text-sm mb-2">
          <span className="px-2 py-1 rounded-md bg-muted text-xs">
            {post.category}
          </span>
          <span>{post.date}</span>
        </div>
        <h3 className="font-medium mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-medium hover:underline">
          Read more
        </Link>
      </div>
    </article>
  );
}
