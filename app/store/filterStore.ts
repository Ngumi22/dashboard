import { create } from "zustand";

interface FilterState {
  selectedCategory: string;
  filters: Record<string, string | string[]>;
  setSelectedCategory: (category: string) => void;
  setFilter: (key: string, value: string | string[]) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategory: "", // Default category
  filters: {},
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () => set({ filters: {} }),
}));
