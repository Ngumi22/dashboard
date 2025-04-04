import Link from "next/link";

export default function NoResults() {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-medium mb-4">No results found</h3>
      <Link
        href="/blog"
        className="inline-flex items-center justify-center px-4 py-2 border rounded-md">
        View all posts
      </Link>
    </div>
  );
}
