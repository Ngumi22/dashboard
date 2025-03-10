"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "./use-debounce";
import {
  SearchParams,
  parseSearchParams,
} from "@/lib/actions/Product/search-params";

export function useProductFilters(initialFilters?: SearchParams) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize filters from URL or initialFilters.
  // Instead of Object.fromEntries (which drops duplicate keys), we build an object
  // preserving multiple values.
  const [filters, setFiltersState] = useState<SearchParams>(() => {
    if (initialFilters) return initialFilters;
    const params: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });
    return parseSearchParams(params);
  });

  // Update filters when searchParams change
  useEffect(() => {
    const params: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });
    const newFilters = parseSearchParams(params);
    setFiltersState(newFilters);
  }, [searchParams]);

  // Debounce filter changes before updating URL
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      // Skip default values so they aren’t added to the URL.
      if (
        (key === "sort" && value === "newest") ||
        (key === "page" && value === 1)
      ) {
        return;
      }
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else {
        params.set(key, String(value));
      }
    });
    // If no query parameters, use the plain pathname.
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl, { scroll: false });
  }, [debouncedFilters, pathname, router]);

  // Method to update filters (merging with existing ones)
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
