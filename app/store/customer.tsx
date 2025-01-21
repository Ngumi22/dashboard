import { deleteCategory } from "@/lib/actions/Category/delete";
import {
  fetchCategoryById,
  getUniqueCategories,
} from "@/lib/actions/Category/fetch";
import { getCachedData, setCachedData, clearCachedData } from "@/lib/cache";
import { StateCreator } from "zustand";

interface Category {
  category_id: string;
  category_name: string;
  category_image: string | null;
  category_description: string;
  category_status: "active" | "inactive";
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | null;
  fetchUniqueCategories: () => Promise<void>;
  deleteCategoryState: (category_id: string) => Promise<{ success: boolean }>;
  fetchCategoryByIdState: (category_id: string) => Promise<Category | null>;
}

export const createCategorySlice: StateCreator<CategoryState> = (set) => ({
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,

  fetchUniqueCategories: async () => {
    const cacheKey = "categories";
    const cachedData = getCachedData<Category[]>(cacheKey);

    if (cachedData) {
      set({ categories: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData = (await getUniqueCategories()) as Category[];

      // Cache the fetched data with a TTL of 2 minutes
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      set({ categories: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching categories",
        loading: false,
      });
    }
  },

  fetchCategoryByIdState: async (category_id: string) => {
    const cacheKey = `category_${category_id}`;
    const cachedCategory = getCachedData<Category>(cacheKey);

    if (cachedCategory) {
      set({ selectedCategory: cachedCategory, loading: false, error: null });
      return cachedCategory;
    }

    set({ loading: true, error: null });

    try {
      const category = await fetchCategoryById(category_id);

      if (category) {
        // Cache the category with a TTL of 2 minutes
        setCachedData(cacheKey, category, { ttl: 2 * 60 });

        set({ selectedCategory: category, loading: false, error: null });
        return category;
      } else {
        set({
          selectedCategory: null,
          error: "Category not found",
          loading: false,
        });
        return null;
      }
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Error fetching category details",
        loading: false,
      });
      return null;
    }
  },

  deleteCategoryState: async (category_id: string) => {
    set({ loading: true });

    try {
      const cacheKey = "categories";

      // Call the server action to delete the category
      await deleteCategory(category_id);

      // Clear the cached data
      clearCachedData(cacheKey);

      // Refetch categories after deletion to get the latest data
      const freshData = (await getUniqueCategories()) as Category[];

      // Update the cache with the fresh data
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      // Update the state with the latest categories
      set({ categories: freshData, loading: false, error: null });

      return { success: true };
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error deleting category",
        loading: false,
      });

      return { success: false };
    }
  },
});
