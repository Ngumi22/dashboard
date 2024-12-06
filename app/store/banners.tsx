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

      // Cache the fetched data with a TTL of 6 hours
      setCachedData(cacheKey, freshData, { ttl: 6 * 60 * 60 });

      set({ banners: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching banners",
        loading: false,
      });
    }
  },
});
