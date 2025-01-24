import {
  fetchSupplierById,
  getUniqueSuppliers,
} from "@/lib/actions/Supplier/fetch";
import { StateCreator } from "zustand";

import { getCachedData, setCachedData } from "@/lib/cache";
import { Supplier } from "@/lib/actions/Supplier/supplierTypes";

export interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  fetchUniqueSuppliers: () => Promise<void>;
  fetchSupplierByIdState: (supplier_id: number) => Promise<Supplier | null>;
  selectedSupplier: Supplier | null;
}

export const createSupplierSlice: StateCreator<SupplierState> = (set, get) => ({
  suppliers: [],
  loading: false,
  error: null,
  selectedSupplier: null,

  fetchUniqueSuppliers: async () => {
    const cacheKey = "suppliers";

    //Check if data is cached
    const cachedData = getCachedData<Supplier[]>(cacheKey);
    if (cachedData) {
      // Prevent unnecessary state updates if the cached data is already present
      const { suppliers } = get();
      if (JSON.stringify(suppliers) !== JSON.stringify(cachedData)) {
        set({ suppliers: cachedData, loading: false, error: null });
      }
      return;
    }

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const suppliers = await getUniqueSuppliers(); // Fetch suppliers
      setCachedData(cacheKey, suppliers, { ttl: 2 * 60 }); // Cache the data for 2 minutes
      set({ suppliers, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch suppliers",
      });
    }
  },

  fetchSupplierByIdState: async (supplier_id: number) => {
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return null;

    set({ loading: true, error: null });
    try {
      const supplier = await fetchSupplierById(supplier_id);
      set({ selectedSupplier: supplier, loading: false });
      return supplier;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch supplier",
        loading: false,
      });
      return null;
    }
  },
});
