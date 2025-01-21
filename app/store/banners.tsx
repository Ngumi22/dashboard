import {
  deleteBanner,
  fetchUsageContexts,
  getUniqueBanners,
} from "@/lib/actions/Banners/fetch";
import {
  CacheUtil,
  clearCachedData,
  getCachedData,
  setCachedData,
} from "@/lib/cache";
import { StateCreator } from "zustand";

interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: string | File;
  text_color: string;
  background_color: string;
  usage_context_id: string;
  context_type: "new" | "existing";
  status: "active" | "inactive";
  new_context_name: string;
  usage_context_name: string;
}

interface Context {
  context: string;
}

export interface BannerState {
  banners: Banner[];
  contexts: any; // Explicitly typed as an array
  loading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
  fetchUsageContexts: () => Promise<void>;
  deleteBannerState: (banner_id: number) => Promise<{ success: boolean }>;
}

export const createBannerSlice: StateCreator<BannerState> = (set) => ({
  banners: [], // Initialize as an empty array
  contexts: [], // Initialize as an empty array
  loading: false,
  error: null,

  fetchBanners: async () => {
    const cacheKey = "banners";
    const cachedData = getCachedData<{ banners: Banner[] }>(cacheKey);

    if (cachedData) {
      set({ banners: cachedData.banners, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const banners = (await getUniqueBanners()) as Banner[];

      // Cache the fetched data with a TTL of 2 minutes
      setCachedData(cacheKey, { banners }, { ttl: 2 * 60 });

      set({ banners, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching banners",
        loading: false,
      });
    }
  },

  fetchUsageContexts: async () => {
    const cacheKey = "contexts";
    const cachedData = getCachedData<Context[]>(cacheKey);

    if (cachedData) {
      set({ contexts: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const contexts = await fetchUsageContexts();

      // Cache the fetched data
      setCachedData(cacheKey, contexts, { ttl: 2 * 60 });

      set({ contexts, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching contexts",
        loading: false,
      });
    }
  },

  deleteBannerState: async (banner_id: number) => {
    set({ loading: true });

    try {
      const cacheKey = "banners";
      // Call server action to delete the banner
      await deleteBanner(banner_id);

      // Clear the cached data
      clearCachedData(cacheKey);

      // Refetch banners after deletion
      const banners = (await getUniqueBanners()) as Banner[];

      // Update the cache with fresh data
      setCachedData(cacheKey, { banners });

      // Update the state
      set({ banners, loading: false, error: null });

      return { success: true };
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error deleting banner",
        loading: false,
      });
      return { success: false };
    }
  },
});
