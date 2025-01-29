import { Category } from "@/lib/actions/Category/catType";
import { deleteCategory } from "@/lib/actions/Category/delete";
import {
  fetchCategoryById,
  fetchCategoryWithSubCat,
  getUniqueCategories,
} from "@/lib/actions/Category/fetch";
import { getCachedData, setCachedData, clearCachedData } from "@/lib/cache";
import { StateCreator } from "zustand";

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | null;
  fetchUniqueCategories: () => Promise<void>;
  fetchUniqueCategoriesWithSubs: () => Promise<void>;
  deleteCategoryState: (category_id: number) => Promise<{ success: boolean }>;
  fetchCategoryByIdState: (category_id: number) => Promise<Category | null>;
}

export const createCategorySlice: StateCreator<CategoryState> = (set, get) => ({
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,

  fetchUniqueCategories: async () => {
    const cacheKey = "categories";

    // Check if data is cached
    const cachedData = getCachedData<Category[]>(cacheKey);
    if (cachedData) {
      // Prevent unnecessary state updates if the cached data is already present
      const { categories } = get();
      if (JSON.stringify(categories) !== JSON.stringify(cachedData)) {
        set({ categories: cachedData, loading: false, error: null });
      }
      return;
    }

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const categories = await getUniqueCategories(); // Fetch categories
      setCachedData(cacheKey, categories, { ttl: 2 * 60 }); // Cache the data for 2 minutes
      set({ categories, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch categories",
      });
    }
  },

  fetchUniqueCategoriesWithSubs: async () => {
    const cacheKey = "categoriesWithSubs";

    // Check if data is cached
    const cachedData = getCachedData<Category[]>(cacheKey);
    if (cachedData) {
      // Prevent unnecessary state updates if the cached data is already present
      const { categories } = get();
      if (JSON.stringify(categories) !== JSON.stringify(cachedData)) {
        set({ categories: cachedData, loading: false, error: null });
      }
      return;
    }

    // Prevent redundant API calls if already loading
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const categories = await fetchCategoryWithSubCat(); // Fetch categories
      setCachedData(cacheKey, categories, { ttl: 2 * 60 }); // Cache the data for 2 minutes
      set({ categories, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch categories",
      });
    }
  },

  fetchCategoryByIdState: async (category_id: number) => {
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

  deleteCategoryState: async (category_id: number) => {
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
