import { fetchBrandById, getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { getCachedData, setCachedData } from "@/lib/cache";
import { StateCreator } from "zustand";

export interface Brand {
  brand_id: number;
  brand_name: string;
  brand_image: File | string | null;
}

export interface BrandState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  selectedBrand: Brand | null;
  fetchUniqueBrands: () => Promise<void>;
  fetchBrandByIdState: (brand_id: string) => Promise<Brand | null>;
}

export const createBrandSlice: StateCreator<BrandState> = (set) => ({
  brands: [],
  loading: false,
  error: null,
  selectedBrand: null,

  fetchUniqueBrands: async () => {
    const cacheKey = "brands";
    const cachedData = getCachedData<Brand[]>(cacheKey);

    if (cachedData) {
      set({ brands: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData = (await getUniqueBrands()) as Brand[];

      // Cache the fetched data with a TTL of 2 minutes
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      set({ brands: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching brands",
        loading: false,
      });
    }
  },

  fetchBrandByIdState: async (brand_id: string) => {
    const cacheKey = `brand_${brand_id}`;
    const cachedBrand = getCachedData<Brand>(cacheKey);

    if (cachedBrand) {
      set({ selectedBrand: cachedBrand, loading: false, error: null });
      return cachedBrand;
    }

    set({ loading: true, error: null });

    try {
      const brand = await fetchBrandById(Number(brand_id));

      if (brand) {
        // Cache the brand with a TTL of 2 minutes
        setCachedData(cacheKey, brand, { ttl: 2 * 60 });

        set({ selectedBrand: brand, loading: false, error: null });
        return brand;
      } else {
        set({
          selectedBrand: null,
          error: "Brand not found",
          loading: false,
        });
        return null;
      }
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Error fetching brand details",
        loading: false,
      });
      return null;
    }
  },
});
