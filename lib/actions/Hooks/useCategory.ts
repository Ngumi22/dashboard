import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { fetchCategoryWithSubCat, getUniqueCategories } from "../Category/get";

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
