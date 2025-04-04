import { Category } from "@/lib/actions/Category/catType";
import { deleteCategory } from "@/lib/actions/Category/delete";
import {
  fetchCategoryByName,
  fetchCategoryWithSubCat,
  fetchCategoryWithSubCatById,
  fetchSubcategoryByName,
} from "@/lib/actions/Category/fetch";
import { StateCreator } from "zustand";

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | null;
  fetchUniqueCategoriesWithSubs: () => Promise<void>;
  deleteCategoryState: (category_id: number) => Promise<{ success: boolean }>;
  fetchCategoryWithSubByIdState: (
    category_id: number
  ) => Promise<Category | null>;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | null;
  categoryDetails: Category | null; // Added this
  subcategoryDetails: Category | null; // Added this
  fetchUniqueCategoriesWithSubs: () => Promise<void>;
  fetchCategoryBySlug: (category_name: string) => Promise<Category | null>;
  fetchSubcategoryBySlug: (
    categorySlug: string,
    subcategorySlug: string
  ) => Promise<Category | null>;
  fetchCategoryWithSubByIdState: (
    category_id: number
  ) => Promise<Category | null>;
  deleteCategoryState: (category_id: number) => Promise<{ success: boolean }>;
}

export const createCategorySlice: StateCreator<CategoryState> = (set, get) => ({
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,
  categoryDetails: null, // Added this
  subcategoryDetails: null, // Added this

  fetchUniqueCategoriesWithSubs: async () => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const categories = await fetchCategoryWithSubCat();
      set({ categories, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch categories",
      });
    }
  },

  fetchCategoryBySlug: async (category_name: string) => {
    try {
      set({ loading: true });
      const category = await fetchCategoryByName(category_name);
      set({
        categoryDetails: category,
        loading: false,
        error: null,
      });
      return category;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Error fetching category",
        loading: false,
      });
      return null;
    }
  },

  fetchSubcategoryBySlug: async (
    categorySlug: string,
    subcategorySlug: string
  ) => {
    try {
      set({ loading: true });
      const subcategory = await fetchSubcategoryByName(
        categorySlug,
        subcategorySlug
      );
      set({
        subcategoryDetails: subcategory,
        loading: false,
        error: null,
      });
      return subcategory;
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Error fetching subcategory",
        loading: false,
      });
      return null;
    }
  },

  fetchCategoryWithSubByIdState: async (category_id: number) => {
    set({ loading: true, error: null });

    try {
      const category = await fetchCategoryWithSubCatById(category_id);

      if (category) {
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
      await deleteCategory(category_id);
      const freshData = await fetchCategoryWithSubCat();

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
