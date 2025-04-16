"use server";

import { unstable_cache as cache } from "next/cache";
import { fetchSupplierById, getUniqueSuppliers } from "./fetch";

const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const supplierKeys = {
  all: ["suppliers"] as const,
  detail: (id: number) => [...supplierKeys.all, "detail", id] as const,
  tree: (id: number) => [...supplierKeys.all, "tree", id] as const,
  subSuppliers: ["sub-suppliers"] as const,
};

// Helper function to convert readonly arrays to mutable arrays
const toMutableArray = <T extends readonly any[]>(arr: T): string[] => [...arr];

// Cached server actions
const cachedGetUniqueSuppliers = cache(
  async () => getUniqueSuppliers(),
  toMutableArray(supplierKeys.all),
  { revalidate: 30 * MINUTE }
);

const cachedFetchSupplierById = cache(
  async (id: number) => fetchSupplierById(id),
  toMutableArray(supplierKeys.detail(0)), // Provide a dummy ID for key pattern
  { revalidate: 30 * MINUTE }
);

export const supplierQueries = {
  all: {
    queryKey: supplierKeys.all,
    queryFn: cachedGetUniqueSuppliers,
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  },

  byId: (id: number) => ({
    queryKey: supplierKeys.detail(id),
    queryFn: () => cachedFetchSupplierById(id),
    staleTime: 30 * MINUTE,
    gcTime: 2 * HOUR,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  }),
};

// Server actions for direct use in components
export const getSuppliersAction = cachedGetUniqueSuppliers;
export const getSupplierByIdAction = cachedFetchSupplierById;
