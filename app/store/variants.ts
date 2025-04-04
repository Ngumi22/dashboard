import {
  fetchVariantById,
  fetchVariantsByProductId,
} from "@/lib/actions/Variants/fetch";
import { Variant } from "@/lib/actions/Variants/types";
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
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const variants = await fetchVariantsByProductId(productId);

      set({ variants, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching variants",
        loading: false,
      });
    }
  },

  fetchVariantByIdState: async (variant_id: number) => {
    set({ loading: true, error: null });

    try {
      const variant = await fetchVariantById(variant_id);

      if (variant) {
        // Cache the variant with a TTL of 2 minutes

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
