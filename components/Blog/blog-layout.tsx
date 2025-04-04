import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("@/components/Blog/sidebar"));
const PostList = dynamic(() => import("./post-list"));

export default function BlogLayout({
  query,
  posts,
}: {
  query: string;
  posts: any[];
}) {
  return (
    <div className="container mt-[9.7rem] lg:mt-[11rem] bg-muted/80 px-4 py-12 mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Bernzz Digital Blog</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar />
        <PostList query={query} posts={posts} />
      </div>
    </div>
  );
}
