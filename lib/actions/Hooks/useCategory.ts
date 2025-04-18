import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  fetchProductByCategory,
  ProductCategory,
} from "../Product/fetchByCategory";
import {
  fetchCategoryWithSubCat,
  getUniqueCategories,
} from "../Category/fetch";
import { fetchSubCategories } from "../Product/fetchBySubCategory";
import { fetchCategoryWithProducts } from "../Product/fetchSub";

const MINUTE = 1000 * 60;

// Hook to fetch categories
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categoryData"],
    queryFn: () => getUniqueCategories(),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}

export function useFetchProductBySubCategory(
  subCategoryName: string,
  options?: UseQueryOptions<any, Error> // Add optional options parameter
) {
  return useQuery({
    queryKey: [`subCategoryProducts:${subCategoryName}`, subCategoryName],
    queryFn: async () => {
      if (!subCategoryName) return null; // Ensure subcategory name exists
      const data = await fetchCategoryWithProducts(subCategoryName);

      return data;
    },
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    enabled: Boolean(subCategoryName), // Run only if subCategoryName is present
    retry: false, // Disable retries to immediately show errors
    ...options, // Spread the options to override defaults
  });
}

export function useFetchSubCategories(categoryName: string) {
  return useQuery({
    queryKey: ["subCategories", categoryName],
    queryFn: async () => {
      const data = await fetchSubCategories(categoryName);

      return data;
    },
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
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
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    enabled: Boolean(categoryName),
  });
}

// Hook to fetch categories
export function useFetchCategoryWithSubCategory() {
  return useQuery({
    queryKey: ["categoryDataWithSub"],
    queryFn: () => fetchCategoryWithSubCat(),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
