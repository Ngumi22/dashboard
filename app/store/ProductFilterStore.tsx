import { create } from "zustand";

interface FilterState {
  filters: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    minDiscount?: number;
    maxDiscount?: number;
    brand?: string;
    category?: string;
    status?: string;
    quantity?: number;
    created_at?: string;
    minRating?: number;
    maxRating?: number;
    tags?: string;
  };
  filteredProducts: any[]; // Cache filtered results
  setFilters: (newFilters: Partial<FilterState["filters"]>) => void;
  setFilteredProducts: (products: any[]) => void;
  resetFilters: () => void;
}

export const useProductFilters = create<FilterState>((set) => ({
  filters: {},
  filteredProducts: [],
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setFilteredProducts: (products) => set({ filteredProducts: products }),
  resetFilters: () => set({ filters: {}, filteredProducts: [] }),
}));
