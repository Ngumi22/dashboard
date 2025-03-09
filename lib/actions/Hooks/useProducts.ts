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
    staleTime: 10 * 60 * 1000, // Data is fresh for 10 minutes
    gcTime: 10 * MINUTE,
  });
}

// Hook to fetch a single product by ID
export function useProductByIdQuery(productId: number) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    staleTime: 1000 * MINUTE, // 30 minutes
    gcTime: 1000 * MINUTE, // 1 hour
    enabled: !!productId, // Only run if productId is defined
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}

export function useProducts(currentPage: number) {
  return useQuery({
    queryKey: ["products", currentPage, {}], // Unique cache key
    queryFn: () => fetchProducts(currentPage, {}),
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 20 * MINUTE, // Garbage collection time is 20 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
