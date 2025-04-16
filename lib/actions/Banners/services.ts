import {
  fetchBannerById,
  fetchBannersByContext,
  fetchUsageContexts,
  getUniqueBanners,
} from "./fetch";

const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const bannerKeys = {
  all: ["banners"] as const,
  context: (ctx: string) => [...bannerKeys.all, "context", ctx] as const,
  detail: (id: number) => [...bannerKeys.all, "detail", id] as const,
  contexts: ["usageContexts"] as const,
};

export const bannerQueries = {
  all: {
    queryKey: bannerKeys.all,
    queryFn: () => getUniqueBanners(),
    staleTime: 30 * MINUTE, // Data is fresh for 30 minutes
    gcTime: 2 * HOUR, // Cache persists for 2 hours
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
    refetchOnMount: false, // Disable refetch on component mount
  },
  byContext: (ctx: string) => ({
    queryKey: bannerKeys.context(ctx),
    queryFn: () => fetchBannersByContext(ctx),
    staleTime: 30 * MINUTE, // Data is fresh for 30 minutes
    gcTime: 2 * HOUR, // Cache persists for 2 hours
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
    refetchOnMount: false, // Disable refetch on component mount
  }),
  byId: (id: number) => ({
    queryKey: bannerKeys.detail(id),
    queryFn: () => fetchBannerById(id),
    staleTime: 30 * MINUTE, // Data is fresh for 30 minutes
    gcTime: 2 * HOUR, // Cache persists for 2 hours
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
    refetchOnMount: false, // Disable refetch on component mount
  }),
  contexts: {
    queryKey: bannerKeys.contexts,
    queryFn: fetchUsageContexts,
    staleTime: 30 * MINUTE, // Data is fresh for 30 minutes
    gcTime: 2 * HOUR, // Cache persists for 2 hours
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
    refetchOnMount: false, // Disable refetch on component mount
  },
};
