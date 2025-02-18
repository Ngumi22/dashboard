"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronDown,
  ArrowUpDown,
  Grid,
  SlidersHorizontal,
} from "lucide-react";

interface ProductsHeaderProps {
  onProductsPerRowChange: (value: string) => void;
  onProductsPerPageChange: (value: string) => void;
  onSortByChange: (value: string) => void;
}

export default function ProductsHeader({
  onProductsPerRowChange,
  onProductsPerPageChange,
  onSortByChange,
}: ProductsHeaderProps) {
  const [productsPerRow, setProductsPerRow] = useState("4");
  const [productsPerPage, setProductsPerPage] = useState("10");
  const [sortBy, setSortBy] = useState("popularity");

  const sortOptions = [
    { value: "alphabetical_asc", label: "Alphabetically, A-Z" },
    { value: "alphabetical_desc", label: "Alphabetically, Z-A" },
    { value: "price_asc", label: "Price, low to high" },
    { value: "price_desc", label: "Price, high to low" },
    { value: "date_asc", label: "Date, old to new" },
    { value: "date_desc", label: "Date, new to old" },
    { value: "rating_desc", label: "Customer Rating, high to low" },
    { value: "rating_asc", label: "Customer Rating, low to high" },
  ];

  const itemsPerPageOptions = [
    { value: "10", label: "10 per page" },
    { value: "20", label: "20 per page" },
    { value: "30", label: "30 per page" },
    { value: "40", label: "40 per page" },
    { value: "50", label: "50 per page" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center space-x-2">
        {["1", "2", "3", "4"].map((value) => (
          <Button
            key={value}
            variant={productsPerRow === value ? "default" : "outline"}
            size="icon"
            className="w-6 h-6"
            onClick={() => {
              setProductsPerRow(value);
              onProductsPerRowChange(value);
            }}>
            <div className="flex items-center justify-center space-x-0.5">
              {[...Array(Number.parseInt(value))].map((_, i) => (
                <div key={i} className="h-3 w-[2px] bg-current" />
              ))}
            </div>
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-20">
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer text-sm font-medium">
              <SlidersHorizontal className="h-3 w-3 m-auto" />
              <span>Sort by </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-0">
            <div className="grid gap-2 p-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSortBy(option.value);
                    onSortByChange(option.value);
                  }}>
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center cursor-pointer text-sm font-medium">
              <span>Show {productsPerPage}</span>
              <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <div className="grid gap-2 p-2">
              {itemsPerPageOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    productsPerPage === option.value ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => {
                    setProductsPerPage(option.value);
                    onProductsPerPageChange(option.value);
                  }}>
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
