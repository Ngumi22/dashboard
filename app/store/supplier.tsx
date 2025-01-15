import {
  fetchSupplierById,
  getUniqueSuppliers,
} from "@/lib/actions/Supplier/fetch";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

export interface Supplier {
  supplier_id?: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone_number?: string;
  supplier_location?: string;
  isNew?: boolean;
}

export interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  fetchUniqueSuppliers: () => Promise<void>;
  fetchSupplierByIdState: (supplier_id: number) => void;
}

export const createSupplierSlice: StateCreator<SupplierState> = (set) => ({
  suppliers: [],
  loading: false,
  error: null,

  fetchUniqueSuppliers: async () => {
    const cacheKey = "suppliersData";
    const cachedData = getCachedData<Supplier[]>(cacheKey);

    if (cachedData) {
      set({ suppliers: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData: Supplier[] = await getUniqueSuppliers();

      // Cache the fetched data with a TTL of
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      set({ suppliers: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching suppliers",
        loading: false,
      });
    }
  },

  fetchSupplierByIdState: async (supplier_id: number) => {
    set({ loading: true });

    try {
      // Call server action to delete the supplier
      await fetchSupplierById(supplier_id);

      // Invalidate the cache
      const cacheKey = "suppliersData";
      setCachedData(cacheKey, null); // Clear the cached data

      // Refetch suppliers after deletion to ensure the latest data
      const freshData: Supplier[] = await getUniqueSuppliers();

      // Update the cache with the fresh data
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      // Update the state with the latest suppliers
      set({ suppliers: freshData, loading: false, error: null });

      // Optionally, show a success toast or notification
      return { success: true };
    } catch (err) {
      // Handle any errors that occur
      set({
        error: err instanceof Error ? err.message : "Error getting supplier",
        loading: false,
      });

      // Optionally, show an error toast or notification
      return { success: false };
    }
  },
});
