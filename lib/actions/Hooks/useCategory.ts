import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchProductByCategory,
  ProductCategory,
} from "../Product/fetchByCategory";
import { getUniqueCategories } from "../Category/fetch";
import {
  fetchProductsBySubCategory,
  fetchSubCategories,
} from "../Product/fetchBySubCategory";

const MINUTE = 1000 * 60;

export function useFetchProductsBySubCategory(subCategoryName: string) {
  return useQuery({
    queryKey: ["subCategoryProducts", subCategoryName],
    queryFn: async () => {
      if (!subCategoryName) return null; // Ensure subcategory name exists
      const data = await fetchProductsBySubCategory(subCategoryName);
      if (!data || data.products.length === 0) {
        throw new Error("No products found for this subcategory.");
      }
      return data;
    },
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 20 * MINUTE, // Garbage collection time is 20 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    enabled: Boolean(subCategoryName), // Run only if subCategoryName is present
    retry: false, // Disable retries to immediately show errors
  });
}
export function useFetchSubCategories(categoryName: string) {
  return useQuery({
    queryKey: ["subCategories", categoryName],
    queryFn: async () => {
      const data = await fetchSubCategories(categoryName);
      if (!data || data.length === 0) {
        throw new Error("No subcategories found for this category.");
      }
      return data;
    },
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 20 * MINUTE, // Garbage collection time is 20 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    retry: false, // Disable retries to immediately show errors
  });
}

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
