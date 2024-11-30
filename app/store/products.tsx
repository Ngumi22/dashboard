// store/products.ts
import { StateCreator } from "zustand";

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export interface ProductState {
  loading: boolean;
  products: Product[];
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const createProductSlice: StateCreator<ProductState> = (set) => ({
  loading: true,
  products: [],
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/productss"); // Replace with your API
      const data: Product[] = await res.json();
      set({ products: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching products",
        loading: false,
      });
    }
  },
});
