"use server";

import { unstable_cache as cache } from "next/cache";
import { fetchBrandById, getUniqueBrands } from "./fetch";

const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const brandKeys = {
  all: ["brands"] as const,
  detail: (id: number) => [...brandKeys.all, "detail", id] as const,
  tree: (id: number) => [...brandKeys.all, "tree", id] as const,
  subBrands: ["sub-brands"] as const,
};

// Helper function to convert readonly arrays to mutable arrays
const toMutableArray = <T extends readonly any[]>(arr: T): string[] => [...arr];

// Cached server actions
const cachedGetUniqueBrands = cache(
  async () => getUniqueBrands(),
  toMutableArray(brandKeys.all),
  { revalidate: 30 * MINUTE }
);

const cachedFetchBrandById = cache(
  async (id: number) => fetchBrandById(id),
  toMutableArray(brandKeys.detail(0)), // Provide a dummy ID for key pattern
  { revalidate: 30 * MINUTE }
);

export const brandQueries = {
  all: {
    queryKey: brandKeys.all,
    queryFn: cachedGetUniqueBrands,
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  },

  byId: (id: number) => ({
    queryKey: brandKeys.detail(id),
    queryFn: () => cachedFetchBrandById(id),
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  }),
};

// Server actions for direct use in components
export const getBrandsAction = cachedGetUniqueBrands;
export const getBrandByIdAction = cachedFetchBrandById;
