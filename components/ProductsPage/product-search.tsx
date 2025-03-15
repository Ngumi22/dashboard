"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { SearchParams } from "@/lib/actions/Product/search-params";

export default function ProductSearch() {
  const { name, setFilters } = useProductFilters();

  const [localSearch, setLocalSearch] = useState<SearchParams["name"]>(name);
  console.log("localSearch:", localSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setFilters({ name: debouncedSearch });
    console.log("debouncedSearch", debouncedSearch);
  }, [debouncedSearch, setFilters]);

  const clearSearch = () => {
    setLocalSearch("");
    setFilters({ name: undefined });
  };

  return (
    <form className="relative w-full sm:max-w-sm">
      <Input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search products"
      />
      {localSearch && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-8 top-0 h-full px-2"
          onClick={clearSearch}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-2">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
