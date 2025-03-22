"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";
import { useProductFilters } from "@/lib/hooks/use-product-filters";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export function ProductSort({
  initialSort = "newest",
}: {
  initialSort?: string;
}) {
  const { sort, setFilters } = useProductFilters();
  const [localSort, setLocalSort] = useState(initialSort || sort || "newest");

  // Sync local state with URL params
  useEffect(() => {
    setLocalSort(sort || "newest");
  }, [sort]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setLocalSort(value);
    setFilters({ sort: value }); // Update the sort parameter in the URL
  };

  // Get the label for the current sort option
  const currentSortLabel =
    sortOptions.find((option) => option.value === localSort)?.label || "Sort";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-[4rem]">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {currentSortLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[4rem]">
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
  );
}
