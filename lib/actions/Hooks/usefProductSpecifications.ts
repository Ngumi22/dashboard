import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProductSpecifications } from "../Specifications/fetch";

const MINUTE = 1000 * 60;

// Hook to fetch a single product by ID
export function useProductSpecifications(product_id: number) {
  return useQuery({
    queryKey: ["Specifications", product_id],
    queryFn: () => getProductSpecifications(product_id),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    enabled: !!product_id, // Only run if product_id is defined
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
