import { fetchBrandById, getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

export interface Brand {
  brand_id: number;
  brand_name: string;
  brand_image: string | File | null;
}

export interface BrandState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  fetchUniqueBrands: () => Promise<void>;
  fetchBrandByIdState: (brand_id: number) => void;
}

export const createBrandSlice: StateCreator<BrandState> = (set) => ({
  brands: [],
  loading: false,
  error: null,

  fetchUniqueBrands: async () => {
    const cacheKey = "brandsData";
    const cachedData = getCachedData<Brand[]>(cacheKey);

    if (cachedData) {
      set({ brands: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData: Brand[] = await getUniqueBrands();

      // Cache the fetched data with a TTL of
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      set({ brands: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching brands",
        loading: false,
      });
    }
  },

  fetchBrandByIdState: async (brand_id: number) => {
    set({ loading: true });

    try {
      // Call server action to delete the brand
      await fetchBrandById(brand_id);

      // Invalidate the cache
      const cacheKey = "brandsData";
      setCachedData(cacheKey, null); // Clear the cached data

      // Refetch brands after deletion to ensure the latest data
      const freshData: Brand[] = await getUniqueBrands();

      // Update the cache with the fresh data
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      // Update the state with the latest brands
      set({ brands: freshData, loading: false, error: null });

      // Optionally, show a success toast or notification
      return { success: true };
    } catch (err) {
      // Handle any errors that occur
      set({
        error: err instanceof Error ? err.message : "Error getting brand",
        loading: false,
      });

      // Optionally, show an error toast or notification
      return { success: false };
    }
  },
});
