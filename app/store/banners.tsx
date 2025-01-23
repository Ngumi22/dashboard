import {
  deleteBanner,
  fetchBannerById,
  fetchUsageContexts,
  getUniqueBanners,
} from "@/lib/actions/Banners/fetch";
import { clearCachedData, getCachedData, setCachedData } from "@/lib/cache";
import { StateCreator } from "zustand";

import { Banner, UsageContext } from "@/lib/actions/Banners/bannerType";

export interface BannerState {
  banners: Banner[]; // Array of Banner objects
  contexts: UsageContext[]; // Array of UsageContext objects
  loading: boolean;
  error: string | null;
  selectedBanner: Banner | null;
  fetchBanners: () => Promise<void>;
  fetchUsageContexts: () => Promise<void>;
  deleteBannerState: (banner_id: number) => Promise<{ success: boolean }>;
  fetchBannerById: (banner_id: number) => Promise<void>;
}

export const createBannerSlice: StateCreator<BannerState> = (set, get) => ({
  banners: [], // Default to an empty array
  contexts: [], // Default to an empty array
  loading: false,
  selectedBanner: null,
  error: null,

  fetchBanners: async () => {
    const cacheKey = "banners";

    // Check if data is cached
    const cachedData = getCachedData<Banner[]>(cacheKey);
    if (cachedData) {
      // Prevent unnecessary state updates if the cached data is already present
      const { banners } = get();
      if (JSON.stringify(banners) !== JSON.stringify(cachedData)) {
        set({ banners: cachedData, loading: false, error: null });
      }
      return;
    }

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const banners = await getUniqueBanners(); // Fetch banners
      setCachedData(cacheKey, banners, { ttl: 2 * 60 }); // Cache the data for 2 minutes
      set({ banners, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch banners",
      });
    }
  },

  fetchBannerById: async (banner_id: number) => {
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });
    try {
      const banner = await fetchBannerById(banner_id);
      set({ selectedBanner: banner, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch banner",
        loading: false,
      });
    }
  },

  fetchUsageContexts: async () => {
    const cacheKey = "contexts";

    // Check if contexts are cached
    const cachedData = getCachedData<UsageContext[]>(cacheKey);
    if (cachedData) {
      set({ contexts: cachedData, loading: false, error: null });
      return;
    }

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const contexts = await fetchUsageContexts(); // Fetch usage contexts
      setCachedData(cacheKey, contexts, { ttl: 2 * 60 }); // Cache the data for 2 minutes
      set({ contexts, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch usage contexts",
      });
    }
  },

  deleteBannerState: async (banner_id: number) => {
    set({ loading: true });

    try {
      const cacheKey = "banners";
      await deleteBanner(banner_id); // Call delete API

      // Immediately clear cache and update state
      clearCachedData(cacheKey); // Clear banners cache
      const banners = await getUniqueBanners(); // Refetch banners
      setCachedData(cacheKey, banners); // Update cache with new banners
      set({ banners, loading: false, error: null }); // Set state with new banners

      return { success: true };
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to delete banner",
      });
      return { success: false };
    }
  },
});
