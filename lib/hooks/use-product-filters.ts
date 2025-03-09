import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "./use-debounce";
import { SearchParams } from "@/lib/actions/Product/search-params";

export function useProductFilters(initialFilters?: SearchParams) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize filters from URL or initialFilters
  const [filters, setFiltersState] = useState<SearchParams>(() => {
    if (initialFilters) return initialFilters;

    const params: SearchParams = {};

    const name = searchParams.get("name");
    if (name) params.name = name;

    const category = searchParams.getAll("category");
    if (category.length > 0) {
      params.category = category.length === 1 ? category[0] : category;
    }

    const brand = searchParams.getAll("brand");
    if (brand.length > 0) {
      params.brand = brand.length === 1 ? brand[0] : brand;
    }

    const specifications = searchParams.getAll("specifications");
    if (specifications.length > 0) {
      params.specifications = specifications.map((spec) => {
        const [key, value] = spec.split(":");
        return `${key.replace("spec_", "").toLowerCase()}:${value}`;
      });
    }

    const page = searchParams.get("page");
    if (page) params.page = Number(page);

    const sort = searchParams.get("sort");
    if (sort) params.sort = sort; // Initialize sort from URL

    return params;
  });

  // Debounce filter changes
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key); // Remove the key if the value is undefined or null
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((item) => params.append(key, item));
      } else {
        params.set(key, String(value));
      }
    });

    // Update the URL without causing a re-render
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedFilters, pathname, router]);

  // Method to update filters
  const setFilters = useCallback((newFilters: Partial<SearchParams>) => {
    setFiltersState((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  }, []);

  return {
    ...filters,
    setFilters,
  };
}
