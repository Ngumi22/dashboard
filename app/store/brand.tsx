import { Brand } from "@/lib/actions/Brand/brandType";
import { fetchBrandById, getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { StateCreator } from "zustand";

export interface BrandState {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  selectedBrand: Brand | null;
  fetchUniqueBrands: () => Promise<void>;
  fetchBrandByIdState: (brand_id: number) => Promise<Brand | null>;
}

export const createBrandSlice: StateCreator<BrandState> = (set, get) => ({
  brands: [],
  loading: false,
  error: null,
  selectedBrand: null,

  fetchUniqueBrands: async () => {
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const brands = await getUniqueBrands();
      set({ brands, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch brands",
      });
    }
  },

  fetchBrandByIdState: async (brand_id: number) => {
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return null;

    set({ loading: true, error: null });
    try {
      const brand = await fetchBrandById(brand_id);
      set({ selectedBrand: brand, loading: false });
      return brand;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch brand",
        loading: false,
      });
      return null;
    }
  },
});
