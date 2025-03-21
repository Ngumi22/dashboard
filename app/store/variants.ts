import {
  fetchVariantById,
  fetchVariantsByProductId,
} from "@/lib/actions/Variants/fetch";
import { Variant } from "@/lib/actions/Variants/types";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

export interface VariantState {
  variants: Variant[];
  selectedVariant: Variant | null;
  loading: boolean;
  error: string | null;
  fetchVariantsState: (productId: number) => Promise<void>;
  fetchVariantByIdState: (variant_id: number) => Promise<Variant | null>;
}

export const createVariantSlice: StateCreator<VariantState> = (set, get) => ({
  variants: [],
  selectedVariant: null,
  loading: false,
  error: null,

  fetchVariantsState: async (productId: number) => {
    const cacheKey = `variants`;
    const cachedData = getCachedData<{ variants: Variant[] }>(cacheKey);

    if (cachedData) {
      // Prevent unnecessary state updates if the cached data is already present
      const { variants } = get();
      if (JSON.stringify(variants) !== JSON.stringify(cachedData.variants)) {
        set({ variants: cachedData.variants, loading: false, error: null });
      }
      return;
    }

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const variants = await fetchVariantsByProductId(productId);

      // Cache the fetched data
      setCachedData(cacheKey, { variants }, { ttl: 16 * 60 });

      set({ variants, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching variants",
        loading: false,
      });
    }
  },

  fetchVariantByIdState: async (variant_id: number) => {
    const cacheKey = `variant_${variant_id}`;
    const cachedVariant = getCachedData<Variant>(cacheKey);

    if (cachedVariant) {
      set({ selectedVariant: cachedVariant, loading: false, error: null });
      return cachedVariant;
    }

    set({ loading: true, error: null });

    try {
      const variant = await fetchVariantById(variant_id);

      if (variant) {
        // Cache the variant with a TTL of 2 minutes
        setCachedData(cacheKey, variant, { ttl: 2 * 60 });

        set({ selectedVariant: variant, loading: false, error: null });
        return variant;
      } else {
        set({
          selectedVariant: null,
          error: "Variant not found",
          loading: false,
        });
        return null;
      }
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Error fetching variant details",
        loading: false,
      });
      return null;
    }
  },
});
