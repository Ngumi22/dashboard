import { getUniqueBanners } from "@/lib/actions/Banners/fetch";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

export interface Banner {
  banner_id?: number;
  title: string;
  description?: string;
  link?: string;
  image?: File | string;
  text_color: string;
  background_color: string;
  usage_context: string;
  status: "active" | "inactive";
}

export interface BannerState {
  banners: Banner[];
  loading: boolean;
  error: string | null;
  fetchBanners: () => Promise<void>;
}

const CACHE_EXPIRATION_MS = 6 * 60 * 60 * 1000; // 6 hours

export const createBannerSlice: StateCreator<BannerState> = (set) => {
  let isFetching = false; // Control flag to prevent duplicate fetches

  const isCacheValid = (cacheTimestamp: number): boolean => {
    const now = Date.now();
    return now - cacheTimestamp < CACHE_EXPIRATION_MS;
  };

  return {
    banners: [],
    loading: false,
    error: null,

    fetchBanners: async () => {
      if (isFetching) return; // Prevent concurrent fetches
      isFetching = true;

      const cacheKey = "bannersData";
      const cacheTimestampKey = `${cacheKey}_timestamp`;

      // Check if cached data exists and is valid
      const cachedBanners = getCachedData<Banner[]>(cacheKey);
      const cacheTimestamp = getCachedData<number>(cacheTimestampKey);

      if (cachedBanners && cacheTimestamp && isCacheValid(cacheTimestamp)) {
        set({ banners: cachedBanners, loading: false, error: null });
        isFetching = false;
        return;
      }

      // Otherwise, fetch fresh data
      set({ loading: true, error: null });

      try {
        const freshData: Banner[] = await getUniqueBanners();

        // Update cache and state
        setCachedData(cacheKey, freshData);
        setCachedData(cacheTimestampKey, Date.now());
        set({ banners: freshData, loading: false, error: null });
      } catch (err) {
        set({
          error: err instanceof Error ? err.message : "Error fetching banners",
          loading: false,
        });
      } finally {
        isFetching = false;
      }
    },
  };
};
