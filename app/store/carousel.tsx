import { getUniqueCarousel } from "@/lib/actions/Carousel/fetch";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: File;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export interface CarouselState {
  carousels: Carousel[];
  loading: boolean;
  error: string | null;
  fetchCarousels: () => Promise<void>;
}

export const createCarouselSlice: StateCreator<CarouselState> = (set) => ({
  carousels: [],
  loading: false,
  error: null,

  fetchCarousels: async () => {
    const cacheKey = "carouselsData";
    const cachedData = getCachedData<Carousel[]>(cacheKey);

    if (cachedData) {
      set({ carousels: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData: Carousel[] = await getUniqueCarousel();

      // Cache the fetched data with a TTL of 6 minutes
      setCachedData(cacheKey, freshData, { ttl: 6 * 60 });

      set({ carousels: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching carousels",
        loading: false,
      });
    }
  },
});
