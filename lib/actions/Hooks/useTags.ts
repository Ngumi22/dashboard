import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductsByTag } from "../Product/fetchByTag";
import { getProductTags } from "../Tags/fetch";

const MINUTE = 1000 * 60;

// Hook to fetch a single product by ID
export function useProductTags(product_id: number) {
  return useQuery({
    queryKey: ["tagsData", product_id],
    queryFn: () => getProductTags(product_id),
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 20 * MINUTE, // Garbage collection time is 20 minutes
    enabled: !!product_id, // Only run if product_id is defined
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}

// Hook to fetch products by tag_name
export function useProductsByTagQuery(tag_name: string) {
  return useQuery({
    queryKey: ["tagProducts", tag_name],
    queryFn: () => fetchProductsByTag(tag_name),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!tag_name, // Only run if tag_name is defined
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
