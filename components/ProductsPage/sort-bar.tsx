"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { ArrowUpDown, Grid, Grid2X2, Grid3X3, LayoutGrid } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "popularity", label: "Popularity" },
];

interface SortBarProps {
  totalProducts: number;
  totalAllProducts: number;
  onGridChange: (grid: number) => void;
  initialSort?: string;
}

export function SortBar({
  totalProducts,
  totalAllProducts,
  onGridChange,
  initialSort = "newest",
}: SortBarProps) {
  const { sort, setFilters } = useProductFilters();
  const [localSort, setLocalSort] = useState(initialSort || sort || "newest");

  // Sync local state with URL params
  useEffect(() => {
    setLocalSort(sort || "newest");
  }, [sort]);

  // Get the label for the current sort option
  const currentSortLabel =
    sortOptions.find((option) => option.value === localSort)?.label || "Sort";
  const [grid, setGrid] = useState(4);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setLocalSort(value);
    setFilters({ sort: value }); // Update the sort parameter in the URL
  };

  const handleGridChange = (newGrid: number) => {
    setGrid(newGrid);
    onGridChange(newGrid);
  };

  return (
    <div className="container border border-gray-400 rounded-md p-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mt-9">
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{totalProducts}</span> of{" "}
        <span className="font-medium text-foreground">{totalAllProducts}</span>{" "}
        products
      </div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[200px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {currentSortLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={localSort === option.value ? "bg-muted" : ""}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex space-x-1">
          <Button
            variant={grid === 1 ? "default" : "outline"}
            size="icon"
            onClick={() => handleGridChange(1)}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={grid === 2 ? "default" : "outline"}
            size="icon"
            onClick={() => handleGridChange(2)}>
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={grid === 3 ? "default" : "outline"}
            size="icon"
            onClick={() => handleGridChange(3)}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={grid === 4 ? "default" : "outline"}
            size="icon"
            onClick={() => handleGridChange(4)}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
