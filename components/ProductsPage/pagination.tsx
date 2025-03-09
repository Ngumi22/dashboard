"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProductFilters } from "@/lib/hooks/use-product-filters";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  // Get page and setFilters from our custom hook
  const { page, setFilters } = useProductFilters();

  // Local state for immediate UI feedback
  const [localPage, setLocalPage] = useState(currentPage || page || 1);

  // Update local state when URL params change
  useEffect(() => {
    setLocalPage(page || 1);
  }, [page]);

  // Navigate to a specific page
  const navigateToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setLocalPage(pageNum);
    setFilters({ page: pageNum });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      // Calculate start and end of page range
      let start = Math.max(2, localPage - 1);
      let end = Math.min(totalPages - 1, localPage + 1);

      // Adjust if at the beginning
      if (localPage <= 2) {
        end = 4;
      }

      // Adjust if at the end
      if (localPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push("ellipsis-start");
      }

      // Add page numbers
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }

      // Always include last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center space-x-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateToPage(localPage - 1)}
        disabled={localPage <= 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      {getPageNumbers().map((page, index) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="outline"
              size="icon"
              disabled>
              ...
            </Button>
          );
        }

        return (
          <Button
            key={page}
            variant={localPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => navigateToPage(Number(page))}>
            {page}
          </Button>
        );
      })}
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateToPage(localPage + 1)}
        disabled={localPage >= totalPages}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </nav>
  );
}
