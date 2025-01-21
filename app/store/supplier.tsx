import {
  fetchSupplierById,
  getUniqueSuppliers,
} from "@/lib/actions/Supplier/fetch";
import { CacheUtil } from "@/lib/cache";
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
  fetchSupplierByIdState: (supplier_id: number) => Promise<Supplier | null>;
}

export const createSupplierSlice: StateCreator<SupplierState> = (set) => ({
  suppliers: [],
  loading: false,
  error: null,

  fetchUniqueSuppliers: async () => {
    const cacheKey = "suppliersData";
    const cachedData = CacheUtil.get<Supplier[]>(cacheKey);

    if (cachedData) {
      set({ suppliers: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData = await getUniqueSuppliers();

      if (Array.isArray(freshData)) {
        // Cache the fetched data
        CacheUtil.set(cacheKey, freshData);

        // Update state
        set({ suppliers: freshData, loading: false, error: null });
      } else {
        throw new Error("Invalid supplier data format");
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching suppliers",
        loading: false,
      });
    }
  },

  fetchSupplierByIdState: async (supplier_id: number) => {
    const cacheKey = `supplier_${supplier_id}`;
    const cachedSupplier = CacheUtil.get<Supplier>(cacheKey);

    if (cachedSupplier) {
      set({ loading: false, error: null });
      return cachedSupplier;
    }

    set({ loading: true, error: null });

    try {
      const supplier = await fetchSupplierById(supplier_id);

      if (supplier) {
        // Cache the fetched supplier data
        CacheUtil.set(cacheKey, supplier);

        // Optionally update state if selected supplier is needed
        set({ loading: false, error: null });
        return supplier;
      } else {
        throw new Error(`Supplier with ID ${supplier_id} not found`);
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching supplier",
        loading: false,
      });
      return null;
    }
  },
});
