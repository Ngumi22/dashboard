import {
  fetchSupplierById,
  getUniqueSuppliers,
} from "@/lib/actions/Supplier/fetch";
import { StateCreator } from "zustand";
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
    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const suppliers = await getUniqueSuppliers(); // Fetch suppliers
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
