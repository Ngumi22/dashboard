import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBannersByContext, getUniqueBanners } from "../Banners/fetch";
import { Banner } from "../Banners/bannerType";

const MINUTE = 1000 * 60;

export function useBannersQuery() {
  return useQuery({
    queryKey: ["bannersData"],
    queryFn: () => getUniqueBanners(),
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 10 * MINUTE,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}

export function useBannersQueryContext(context_name: string) {
  return useQuery({
    queryKey: ["bannerData", context_name], // Use context_name as part of the query key
    queryFn: async () => {
      if (!context_name) return null; // Return null if no brand name is provided
      const data = await fetchBannersByContext(context_name); // Fetch products for the brand
      return data; // Return the Banner object
    },
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 20 * MINUTE, // Garbage collection time is 20 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    enabled: Boolean(context_name),
  });
}
