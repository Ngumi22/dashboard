import dynamic from "next/dynamic";

const PostCard = dynamic(() => import("./post-card"));
const NoResults = dynamic(() => import("./no-results"));

export default function PostList({
  query,
  posts,
}: {
  query: string;
  posts: any[];
}) {
  return (
    <main className="w-full lg:w-3/4">
      {query && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Results for: <span className="text-primary">{query}</span>
          </h2>
          <p className="text-muted-foreground">
            {posts.length} {posts.length === 1 ? "result" : "results"}
          </p>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <NoResults />
      )}
    </main>
  );
}
