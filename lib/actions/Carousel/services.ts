import { fetchCarouselById, getUniqueCarousels } from "./fetch";

const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const carouselKeys = {
  all: ["carousels"] as const,
  context: (ctx: string) => [...carouselKeys.all, "context", ctx] as const,
  detail: (id: number) => [...carouselKeys.all, "detail", id] as const,
  contexts: ["usageContexts"] as const,
};

export const carouselQueries = {
  all: {
    queryKey: carouselKeys.all,
    queryFn: () => getUniqueCarousels(),
    staleTime: 30 * MINUTE, // Data is fresh for 30 minutes
    gcTime: 7 * DAY, // Cache persists for 7 days
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
    refetchOnMount: false, // Disable refetch on component mount
  },

  byId: (id: number) => ({
    queryKey: carouselKeys.detail(id),
    queryFn: () => fetchCarouselById(id),
    staleTime: 30 * MINUTE, // Data is fresh for 30 minutes
    gcTime: 7 * DAY, // Cache persists for 7 days
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
    refetchOnMount: false, // Disable refetch on component mount
  }),
};
