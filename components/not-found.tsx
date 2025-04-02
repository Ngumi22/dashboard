import Link from "next/link";

// Tiny component - no need for dynamic imports
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <Link
        href="/"
        className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
