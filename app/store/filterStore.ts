import { create } from "zustand";

interface FilterState {
  filters: Record<string, string | string[]>;
  setFilter: (key: string, value: string | string[]) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () => set({ filters: {} }),
}));
