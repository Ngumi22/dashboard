import {
  deleteCarousel,
  getUniqueCarousels,
} from "@/lib/actions/Carousel/fetch";
import { clearCachedData, getCachedData, setCachedData } from "@/lib/cache";
import { StateCreator } from "zustand";

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: File | string | null; // Adjusted for base64 handling
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export interface CarouselState {
  carousels: Carousel[];
  loading: boolean;
  error: string | null;
  fetchCarousels: () => Promise<void>;
  deleteCarouselState: (carousel_id: number) => Promise<boolean>;
}

export const createCarouselSlice: StateCreator<CarouselState> = (set) => ({
  carousels: [],
  loading: false,
  error: null,

  fetchCarousels: async () => {
    const cacheKey = "carousels";
    const cachedData = getCachedData<Carousel[]>(cacheKey);

    if (cachedData) {
      set({ carousels: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData = (await getUniqueCarousels()) as Carousel[];

      // Cache the fetched data with a TTL of 2 minutes
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      set({ carousels: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Unexpected error while fetching carousels.",
        loading: false,
      });
    }
  },

  deleteCarouselState: async (carousel_id: number) => {
    set({ loading: true });

    try {
      // Invalidate the cache
      const cacheKey = "carousels";
      await deleteCarousel(carousel_id);

      // Clear the cached data
      clearCachedData(cacheKey);

      // Refetch carousels after deletion
      const freshData = (await getUniqueCarousels()) as Carousel[];

      // Cache the fresh data
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      // Update the state with the latest data
      set({ carousels: freshData, loading: false, error: null });

      return true;
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Unexpected error while deleting the carousel.",
        loading: false,
      });
      return false;
    }
  },
});
