import { deleteCategory } from "@/lib/actions/Category/delete";
import { getUniqueCategories } from "@/lib/actions/Category/fetch";
import { getCachedData, setCachedData } from "@/lib/utils";
import { StateCreator } from "zustand";

interface Category {
  category_id: number;
  category_name: string;
  category_image: string;
  category_description: string;
  status: "active" | "inactive";
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchUniqueCategories: () => Promise<void>;
  deleteCategoryState: (category_id: number) => void;
}

export const createCategorySlice: StateCreator<CategoryState> = (set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchUniqueCategories: async () => {
    const cacheKey = "categoriesData";
    const cachedData = getCachedData<Category[]>(cacheKey);

    if (cachedData) {
      set({ categories: cachedData, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      const freshData: Category[] = await getUniqueCategories();

      // Cache the fetched data with a TTL of
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      set({ categories: freshData, loading: false, error: null });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching categories",
        loading: false,
      });
    }
  },

  deleteCategoryState: async (category_id: number) => {
    set({ loading: true });

    try {
      // Call server action to delete the category
      await deleteCategory(String(category_id));

      // Invalidate the cache
      const cacheKey = "categorysData";
      setCachedData(cacheKey, null); // Clear the cached data

      // Refetch categorys after deletion to ensure the latest data
      const freshData: Category[] = await getUniqueCategories();

      // Update the cache with the fresh data
      setCachedData(cacheKey, freshData, { ttl: 2 * 60 });

      // Update the state with the latest categorys
      set({ categories: freshData, loading: false, error: null });

      // Optionally, show a success toast or notification
      return { success: true };
    } catch (err) {
      // Handle any errors that occur
      set({
        error: err instanceof Error ? err.message : "Error deleting category",
        loading: false,
      });

      // Optionally, show an error toast or notification
      return { success: false };
    }
  },
});
