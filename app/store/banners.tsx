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
    let cachedBanners = getCachedData<Banner[]>(cacheKey);

    // If cached, set banners immediately and return
    if (cachedBanners) {
      set({ banners: cachedBanners, loading: false, error: null });
      return;
    }

    // If not cached, begin the fetching process
    set({ loading: true, error: null });
    try {
      const data: Banner[] = await getUniqueBanners();
      setCachedData(cacheKey, data); // Save to cache
      // Use a single set call with a batched update
      set((state) => ({
        banners: data,
        loading: false,
        error: null,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching banners",
        loading: false,
      });
    }
  },
});
