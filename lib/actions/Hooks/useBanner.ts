import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBannersByContext, getUniqueBanners } from "../Banners/fetch";

const MINUTE = 1000 * 60;

export function useBannersQueryContext(context_name: string) {
  return useQuery({
    queryKey: ["bannerData", context_name], // Must match server-side
    queryFn: () => fetchBannersByContext(context_name),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hours
    placeholderData: keepPreviousData,
    enabled: Boolean(context_name),
  });
}

export function useBannersQuery() {
  return useQuery({
    queryKey: ["bannersData"],
    queryFn: () => getUniqueBanners(),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
