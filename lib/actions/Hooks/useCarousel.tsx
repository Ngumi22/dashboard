import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCarousels } from "../Carousel/fetch";

const MINUTE = 1000 * 60;

export function useCarouselsQuery() {
  return useQuery({
    queryKey: ["carouselsData"],
    queryFn: () => fetchCarousels(),
    staleTime: 10 * MINUTE, // Data is fresh for 10 minutes
    gcTime: 10 * MINUTE,
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });
}
