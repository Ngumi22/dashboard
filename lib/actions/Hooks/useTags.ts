import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductsByTag } from "../Product/fetchByTag";

const MINUTE = 1000 * 60;

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
