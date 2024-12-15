import {
  deleteCarousel,
  getUniqueCarousel,
} from "@/lib/actions/Carousel/fetch";
import { updateCarouselAction } from "@/lib/actions/Carousel/update";
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
  deleteCarouselState: (carousel_id: number) => void;
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
      setCachedData(cacheKey, freshData, { ttl: 1 * 60 });

      set({ carousels: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching carousels",
        loading: false,
      });
    }
  },
  deleteCarouselState: async (carousel_id: number) => {
    set({ loading: true });

    try {
      // Server action to delete the carousel
      await deleteCarousel(carousel_id);

      // Invalidate the cache
      const cacheKey = "carouselsData";
      setCachedData(cacheKey, null); // Clear the cached data

      // Refetch the latest carousel data
      const freshData: Carousel[] = await getUniqueCarousel();

      // Update the cache with the fresh data
      setCachedData(cacheKey, freshData, { ttl: 1 * 60 });

      // Update the state with the latest carousels
      set({ carousels: freshData, loading: false, error: null });

      // Optionally, show a success toast or notification
      return { success: true };
    } catch (err) {
      // Handle any errors that occur
      set({
        error: err instanceof Error ? err.message : "Error deleting carousel",
        loading: false,
      });

      // Optionally, show an error toast or notification
      return { success: false };
    }
  },
});
