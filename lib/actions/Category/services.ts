"use server";

import { unstable_cache as cache } from "next/cache";
import {
  fetchCategoryWithSubCatById,
  fetchCategoryWithSubCat,
  getCategoryById,
  getUniqueCategories,
} from "./get";

const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const categoryKeys = {
  all: ["categories"] as const,
  detail: (id: number) => [...categoryKeys.all, "detail", id] as const,
  tree: (id: number) => [...categoryKeys.all, "tree", id] as const,
  subCategories: ["sub-categories"] as const,
};

// Helper function to convert readonly arrays to mutable arrays
const toMutableArray = <T extends readonly any[]>(arr: T): string[] => [...arr];

// Cached server actions
const cachedGetUniqueCategories = cache(
  async () => getUniqueCategories(),
  toMutableArray(categoryKeys.all),
  { revalidate: 30 * MINUTE }
);

const cachedFetchCategoryById = cache(
  async (id: number) => getCategoryById(id),
  toMutableArray(categoryKeys.detail(0)), // Provide a dummy ID for key pattern
  { revalidate: 30 * MINUTE }
);

const cachedFetchCategoryTree = cache(
  async (id: number) => fetchCategoryWithSubCatById(id),
  toMutableArray(categoryKeys.tree(0)), // Provide a dummy ID for key pattern
  { revalidate: 30 * MINUTE }
);

const cachedFetchAllSubCategories = cache(
  async () => fetchCategoryWithSubCat(),
  toMutableArray(categoryKeys.subCategories),
  { revalidate: 30 * MINUTE }
);

export const categoryQueries = {
  all: {
    queryKey: categoryKeys.all,
    queryFn: cachedGetUniqueCategories,
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  },

  byId: (id: number) => ({
    queryKey: categoryKeys.detail(id),
    queryFn: () => cachedFetchCategoryById(id),
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  }),

  subCategories: {
    queryKey: categoryKeys.subCategories,
    queryFn: cachedFetchAllSubCategories,
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  },

  subCategoriesById: (category_id: number) => ({
    queryKey: [...categoryKeys.subCategories, category_id],
    queryFn: () => cachedFetchCategoryTree(category_id),
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  }),
};

// Server actions for direct use in components
export const getCategoriesAction = cachedGetUniqueCategories;
export const getCategoryByIdAction = cachedFetchCategoryById;
export const getCategoryTreeAction = cachedFetchCategoryTree;
export const getSubCategoriesAction = cachedFetchAllSubCategories;
