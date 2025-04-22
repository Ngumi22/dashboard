"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchParams } from "@/lib/actions/Product/searchTypes";
import { createUrl } from "@/lib/actions/Product/utils";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownUp,
  RefreshCw,
  Sparkles,
  Grid,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";

interface ProductsHeaderProps {
  totalProducts: number;
  searchParams: SearchParams;
  grid: 1 | 2 | 3 | 4;
  onGridChange: (grid: 1 | 2 | 3 | 4) => void;
}

export function ProductsHeader({
  totalProducts,
  searchParams,
  grid,
  onGridChange,
}: ProductsHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(
      searchParams as Record<string, string>
    );

    if (value === "default") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", value);
    }

    newParams.delete("page"); // Reset to page 1 on sort change
    router.push(createUrl(pathname, newParams));
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  const currentSort = searchParams.sort || "newest";

  const hasFilters = Object.keys(searchParams).some(
    (key) =>
      key !== "sort" && key !== "page" && key !== "perPage" && key !== "grid"
  );

  return (
    <div className="md:border border-gray-400 rounded-md flex justify-between items-center p-1 mb-2 w-full">
      <p className="text-nowrap text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{totalProducts}</span>{" "}
        products
        {hasFilters && " (filtered)"}
      </p>
      <div className="flex justify-between items-center gap-8">
        <GridToolbar grid={grid} onGridChange={onGridChange} />
        <div className="flex items-center gap-3 w-full sm:w-auto my-auto justify-end">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="min-w-[200px]">
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Newest</span>
                </div>
              </SelectItem>
              <SelectItem value="popularity">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Popularity</span>
                </div>
              </SelectItem>
              <SelectItem value="price-asc">
                <div className="flex items-center gap-2">
                  <ArrowUpAZ className="h-4 w-4" />
                  <span>Price: Low to High</span>
                </div>
              </SelectItem>
              <SelectItem value="price-desc">
                <div className="flex items-center gap-2">
                  <ArrowDownAZ className="h-4 w-4" />
                  <span>Price: High to Low</span>
                </div>
              </SelectItem>
              <SelectItem value="name-asc">
                <div className="flex items-center gap-2">
                  <ArrowDownUp className="h-4 w-4" />
                  <span>Name: A to Z</span>
                </div>
              </SelectItem>
              <SelectItem value="name-desc">
                <div className="flex items-center gap-2">
                  <ArrowDownUp className="h-4 w-4" />
                  <span>Name: Z to A</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetFilters}
              title="Reset all filters">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Reset filters</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface GridToolbarProps {
  grid: 1 | 2 | 3 | 4;
  onGridChange: (grid: 1 | 2 | 3 | 4) => void;
}

function GridToolbar({ grid, onGridChange }: GridToolbarProps) {
  return (
    <div className="hidden md:flex space-x-2">
      {([1, 2, 3, 4] as const).map((value) => {
        const Icon = [Grid, Grid2X2, Grid3X3, LayoutGrid][value - 1];
        return (
          <Button
            key={value}
            variant={grid === value ? "default" : "outline"}
            size="icon"
            onClick={() => onGridChange(value)}>
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
