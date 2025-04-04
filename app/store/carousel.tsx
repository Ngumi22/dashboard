import {
  deleteCarousel,
  fetchCarouselById,
  getUniqueCarousels,
} from "@/lib/actions/Carousel/fetch";
import { StateCreator } from "zustand";

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: string | File | null | Buffer;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export interface CarouselState {
  carousels: Carousel[]; // Array of Carousel objects
  loading: boolean;
  error: string | null;
  selectedCarousel: Carousel | null;
  fetchCarousels: () => Promise<void>;
  deleteCarouselState: (carousel_id: number) => Promise<boolean>;
  fetchCarouselById: (carousel_id: number) => Promise<void>;
}

export const createCarouselSlice: StateCreator<CarouselState> = (set, get) => ({
  carousels: [],
  loading: false,
  error: null,
  selectedCarousel: null,

  fetchCarousels: async () => {
    const cacheKey = "carousels";

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const carousels = await getUniqueCarousels(); // Fetch carousels
      set({ carousels, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch carousels",
      });
    }
  },

  deleteCarouselState: async (carousel_id: number) => {
    set({ loading: true });

    try {
      // Invalidate the cache
      const cacheKey = "carousels";
      await deleteCarousel(carousel_id);

      // Refetch carousels after deletion
      const freshData = (await getUniqueCarousels()) as Carousel[];

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

  fetchCarouselById: async (carousel_id: number) => {
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });
    try {
      const banner = await fetchCarouselById(carousel_id);
      set({ selectedCarousel: banner, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch banner",
        loading: false,
      });
    }
  },
});
