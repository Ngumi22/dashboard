import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchProducts } from "../Product/fetch";
import { SearchParams } from "../Product/productTypes";

const MINUTE = 1000 * 60;

// Hook to fetch products with filters and pagination
export function useProductsQuery(
  currentPage: number,
  filter: Record<string, string | string[]>
) {
  return useQuery({
    queryKey: ["products", currentPage, filter],
    queryFn: () => fetchProducts(currentPage, filter),
    staleTime: 10 * 60 * 1000, // Data is fresh for 10 minutes
    gcTime: 10 * MINUTE,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}

// Hook to fetch a single product by ID
export function useProductByIdQuery(productId: number) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!productId, // Only run if productId is defined
  });
}
