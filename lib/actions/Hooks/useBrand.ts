import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductByBrand, ProductBrand } from "../Product/fetchByBrands";
import { getUniqueBrands } from "../Brand/fetch";

const MINUTE = 1000 * 60;

export function useBrandProductsQuery(brandName: string) {
  return useQuery<ProductBrand | null, Error>({
    queryKey: [`brandProducts`, brandName], // Use brandName as part of the query key
    queryFn: async () => {
      if (!brandName) return null; // Return null if no brand name is provided
      const data = await fetchProductByBrand(brandName); // Fetch products for the brand
      return data; // Return the ProductBrand object
    },
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 20 * MINUTE, // Garbage collection time is 20 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    enabled: Boolean(brandName),
  });
}

export function useBrandsQuery() {
  return useQuery({
    queryKey: ["brandData"],
    queryFn: () => getUniqueBrands(),
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 10 * MINUTE,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
