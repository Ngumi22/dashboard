// store/filters.ts
import { StateCreator } from "zustand";

export interface FilterState {
  searchTerm: string;
  activeTab: string;
  brand: string | null;
  category: string | null;
  priceRange: [number, number] | null;
  discount: [number, number] | null;
  supplier: string | null;
  setFilters: (filters: Partial<FilterState>) => void;
}

export const createFilterSlice: StateCreator<FilterState> = (set) => ({
  searchTerm: "",
  activeTab: "all",
  brand: null,
  category: null,
  priceRange: null,
  discount: null,
  supplier: null,
  setFilters: (filters) => set(filters),
});
