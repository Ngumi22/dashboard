import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchProductByCategory,
  ProductCategory,
} from "../Product/fetchByCategory";
import { getUniqueCategories } from "../Category/fetch";

const MINUTE = 1000 * 60;

export function useCategoryProductQuery(categoryName: string) {
  return useQuery<ProductCategory | null, Error>({
    queryKey: [`categoryProducts`, categoryName], // Use categoryName as part of the query key
    queryFn: async () => {
      if (!categoryName) return null; // Return null if no category name is provided
      const data = await fetchProductByCategory(categoryName); // Fetch products for the category
      return data; // Return the ProductCategory object
    },
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 20 * MINUTE, // Garbage collection time is 20 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    enabled: Boolean(categoryName),
  });
}

// Hook to fetch categories
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categoryData"],
    queryFn: () => getUniqueCategories(),
    staleTime: 10 * 60 * 1000, // Data is fresh for 10 minutes
    gcTime: 10 * MINUTE,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
