"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";
import { useProductView } from "./product-view-context";
import { Product } from "@/lib/actions/Product/search-params";

export function ProductGrid({
  products,
  searchParams,
  totalPages,
}: {
  products: Product[];
  searchParams: Record<string, string | string[] | undefined>;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { gridView, perPage } = useProductView();

  // Get current page from URL
  const currentPage = Number(searchParams.page || "1");

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Prefetch adjacent pages for faster navigation
  useEffect(() => {
    // Prefetch next page if available
    if (currentPage < totalPages) {
      const nextPageParams = new URLSearchParams();

      // Add all current search params
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) nextPageParams.set(key, value.toString());
      });

      // Set next page
      nextPageParams.set("page", (currentPage + 1).toString());

      router.prefetch(`${pathname}?${nextPageParams.toString()}`);
    }

    // Prefetch previous page if available
    if (currentPage > 1) {
      const prevPageParams = new URLSearchParams();

      // Add all current search params
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) prevPageParams.set(key, value.toString());
      });

      // Set previous page
      prevPageParams.set("page", (currentPage - 1).toString());

      router.prefetch(`${pathname}?${prevPageParams.toString()}`);
    }
  }, [currentPage, totalPages, router, pathname, searchParams]);

  // Navigate to page
  const goToPage = useCallback(
    (page: number) => {
      setIsLoading(true);
      // Create new URLSearchParams object from current searchParams
      const params = new URLSearchParams();

      // Add all current search params
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });

      // Set page
      params.set("page", page.toString());

      // Update URL
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setIsLoading(false);
    },
    [searchParams, router, pathname]
  );

  // Add useEffect to reset loading state when products change
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Determine grid columns based on grid view
  const gridCols = {
    "1": "grid-cols-1",
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[gridView];

  return (
    <div className="space-y-8">
      <div className={cn("grid gap-4", gridCols)}>
        {isLoading ? (
          // Show skeleton loaders when loading
          Array.from({ length: Number(perPage) }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="border rounded-lg p-4 animate-pulse">
              <div className="bg-muted aspect-square w-full mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find what you are looking for.
            </p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              gridView={gridView}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;

              // Show first page, last page, current page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => goToPage(page)}
                    className="h-8 w-8">
                    {page}
                  </Button>
                );
              }

              // Show ellipsis for skipped pages
              if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
