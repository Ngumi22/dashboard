"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, Columns2, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProductView } from "./product-view-context";

export function ProductSortBar({
  searchParams,
  totalProducts,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  totalProducts: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { gridView, setGridView, perPage, setPerPage } = useProductView();

  // Get current sort from URL
  const currentSort = searchParams.sort?.toString() || "featured";

  // Update URL with new sort
  const updateSort = useCallback(
    (sort: string) => {
      // Create new URLSearchParams object from current searchParams
      const params = new URLSearchParams();

      // Add all current search params
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && key !== "sort") params.set(key, value.toString());
      });

      // Update sort
      params.set("sort", sort);

      // Reset to page 1 when sort changes
      params.set("page", "1");

      // Update URL
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Handle per page change
  const handlePerPageChange = useCallback(
    (value: string) => {
      setPerPage(value);

      // Create new URLSearchParams object from current searchParams
      const params = new URLSearchParams();

      // Add all current search params
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && key !== "page") params.set(key, value.toString());
      });

      // Reset to page 1 when per page changes
      params.set("page", "1");

      // Update URL
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname, setPerPage]
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg bg-background">
      <div>
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{totalProducts}</span>{" "}
          products
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort:</span>
          <Select value={currentSort} onValueChange={updateSort}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Show:</span>
          <Select value={perPage} onValueChange={handlePerPageChange}>
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue placeholder="12" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="36">36</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-none",
              gridView === "1" && "bg-muted"
            )}
            onClick={() => setGridView("1")}>
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-none",
              gridView === "2" && "bg-muted"
            )}
            onClick={() => setGridView("2")}>
            <Columns2 className="h-4 w-4" />
            <span className="sr-only">2-column grid</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-none",
              gridView === "3" && "bg-muted"
            )}
            onClick={() => setGridView("3")}>
            <Columns3 className="h-4 w-4" />
            <span className="sr-only">3-column grid</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-none",
              gridView === "4" && "bg-muted"
            )}
            onClick={() => setGridView("4")}>
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">4-column grid</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
