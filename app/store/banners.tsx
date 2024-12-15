import { deleteBanner, getUniqueBanners } from "@/lib/actions/Banners/fetch";
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
  deleteBannerState: (banner_id: number) => void;
}

export const createBannerSlice: StateCreator<BannerState> = (set) => ({
  banners: [],
  loading: false,
  error: null,

  fetchBanners: async () => {
    const cacheKey = "bannersData";
    const cachedData = getCachedData<Banner[]>(cacheKey);

    if (cachedData) {
      set({ banners: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData: Banner[] = await getUniqueBanners();

      // Cache the fetched data with a TTL of
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      set({ banners: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching banners",
        loading: false,
      });
    }
  },

  deleteBannerState: async (banner_id: number) => {
    set({ loading: true });

    try {
      // Call server action to delete the banner
      await deleteBanner(banner_id);

      // Invalidate the cache
      const cacheKey = "bannersData";
      setCachedData(cacheKey, null); // Clear the cached data

      // Refetch banners after deletion to ensure the latest data
      const freshData: Banner[] = await getUniqueBanners();

      // Update the cache with the fresh data
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      // Update the state with the latest banners
      set({ banners: freshData, loading: false, error: null });

      // Optionally, show a success toast or notification
      return { success: true };
    } catch (err) {
      // Handle any errors that occur
      set({
        error: err instanceof Error ? err.message : "Error deleting banner",
        loading: false,
      });

      // Optionally, show an error toast or notification
      return { success: false };
    }
  },
});
