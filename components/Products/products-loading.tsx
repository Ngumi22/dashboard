import { Skeleton } from "@/components/ui/skeleton";

export function ProductsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
