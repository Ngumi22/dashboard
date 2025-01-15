import {
  deleteCarousel,
  getUniqueCarousels,
} from "@/lib/actions/Carousel/fetch";
import { getCachedData, setCachedData } from "@/lib/utils";
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
    const cacheKey = "carouselsData";
    const cachedData = getCachedData<Carousel[]>(cacheKey);

    if (cachedData) {
      set({ carousels: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData: Carousel[] = await getUniqueCarousels();

      setCachedData(cacheKey, freshData, { ttl: 1 * 60 });
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
      await deleteCarousel(carousel_id);
      set({ carousels: [], error: null });

      const freshData: Carousel[] = await getUniqueCarousels();
      setCachedData("carouselsData", freshData, { ttl: 1 * 60 });
      set({ carousels: freshData, loading: false });
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
