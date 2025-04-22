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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { SearchParams } from "@/lib/actions/Product/searchTypes";
import { createUrl } from "@/lib/actions/Product/utils";

interface ProductsPaginationProps {
  pagination: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
  searchParams: SearchParams;
}

export function ProductsPagination({
  pagination,
  searchParams,
}: ProductsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { totalPages, currentPage } = pagination;

  // Handle page change
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(
      searchParams as Record<string, string>
    );

    if (page === 1) {
      newParams.delete("page");
    } else {
      newParams.set("page", page.toString());
    }

    router.push(createUrl(pathname, newParams));
  };

  // Handle per page change
  const handlePerPageChange = (perPage: string) => {
    const newParams = new URLSearchParams(
      searchParams as Record<string, string>
    );

    if (perPage === "12") {
      newParams.delete("perPage");
    } else {
      newParams.set("perPage", perPage);
    }

    // Reset to page 1 when perPage changes
    newParams.delete("page");

    router.push(createUrl(pathname, newParams));
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first and last page
      pageNumbers.push(1);

      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning or end
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push("ellipsis-start");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }

      // Add last page if not already included
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  const currentPerPage = searchParams.perPage?.toString() || "12";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show</span>
        <Select value={currentPerPage} onValueChange={handlePerPageChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="12" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="36">36</SelectItem>
            <SelectItem value="48">48</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>

      <nav className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex">
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <div
                  key={page}
                  className="px-2 py-1 text-sm text-muted-foreground">
                  ...
                </div>
              );
            }

            return (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page as number)}
                className="h-8 w-8">
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex">
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </nav>
    </div>
  );
}
