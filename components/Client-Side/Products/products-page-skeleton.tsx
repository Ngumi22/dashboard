import { Skeleton } from "@/components/ui/skeleton";

export function ProductsPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
      <div className="space-y-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2 border rounded-lg p-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
