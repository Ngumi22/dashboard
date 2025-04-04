import type { Metadata } from "next";
import { getPostBySlug } from "../blog-data";

const baseUrl = "https://www.bernzzdigitalsolutions.co.ke";

export const metadata: Metadata = {
  title: "Blog | Bernzz Digital",
  description: "Tech news and insights from Bernzz Digital",
  openGraph: {
    title: "Bernzz Digital Blog",
    images: "/opengraph-image.png",
  },
  alternates: {
    canonical: baseUrl,
  },
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | BDS Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    authors: [{ name: post.author }],
  };
}
