import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUniqueCarousels } from "../Carousel/fetch";

const MINUTE = 1000 * 60;

export function useCarouselsQuery() {
  return useQuery({
    queryKey: ["carouselsData"],
    queryFn: () => getUniqueCarousels(),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
