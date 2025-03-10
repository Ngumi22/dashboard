import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchProducts } from "../Product/fetch";

const MINUTE = 1000 * 60;

// Hook to fetch products with filters and pagination
export function useProductsQuery(
  currentPage: number,
  filter: Record<string, string | string[]>
) {
  return useQuery({
    queryKey: ["products", currentPage, filter],
    queryFn: async () =>
      (await fetchProducts(currentPage, filter)) || { products: [] },
    placeholderData: keepPreviousData,
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
  });
}

// Hook to fetch a single product by ID
export function useProductByIdQuery(productId: number) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    enabled: !!productId, // Only run if productId is defined
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}

export function useProducts(currentPage: number) {
  return useQuery({
    queryKey: ["products", currentPage, {}], // Unique cache key
    queryFn: () => fetchProducts(currentPage, {}),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
