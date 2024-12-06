import { fetchFilteredProductsFromDb } from "@/lib/actions/Product/fetch";
import { Product, SearchParams } from "@/lib/types";
import { getCachedData, setCachedData } from "@/lib/utils";
import { create } from "zustand";

export interface ProductState {
  loading: boolean;
  products: Product[];
  error: string | null;
  currentPage: number;
  filters: SearchParams;
  fetchProducts: (page?: number, filters?: SearchParams) => Promise<void>;
  setFilters: (filters: SearchParams) => void;
  resetFilters: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  loading: false,
  products: [],
  error: null,
  currentPage: 1,
  filters: {} as SearchParams,

  // Fetch products from DB or cache
  fetchProducts: async (page = get().currentPage, filters = get().filters) => {
    const cacheKey = `products_${page}_${JSON.stringify(filters)}`;
    const cachedData = getCachedData<Product[]>(cacheKey);

    // Return cached data if available
    if (cachedData) {
      set({ products: cachedData, loading: false });
      return;
    }

    // Start loading and reset error state
    set({ loading: true, error: null });

    try {
      // Fetch products from the database
      const products = await fetchFilteredProductsFromDb(page, filters);

      console.log(products);

      // Cache the fetched data with a TTL of 5 minutes
      setCachedData(cacheKey, products, { ttl: 300 });

      // Update the store with fetched data
      set({ products, loading: false, currentPage: page });
    } catch (err) {
      // Handle errors and update the error state
      set({
        error: err instanceof Error ? err.message : "Error fetching products",
        loading: false,
      });
    }
  },

  // Set the filters in the state
  setFilters: (filters: SearchParams) => {
    set({ filters });
  },

  // Reset filters and the current page
  resetFilters: () => {
    set({ filters: {}, currentPage: 1 });
  },
}));
