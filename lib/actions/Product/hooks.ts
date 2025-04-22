import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchParams } from "./search-params";
import { Product } from "./actions/search-params";
import {
  createProductAction,
  deleteProductAction,
  updateProductActionWrapper,
} from "./dataFetch";
// Cache constants
const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface ProductFilters {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  specifications: { id: string; name: string; values: string[] }[];
  minPrice: number;
  maxPrice: number;
  tags: string[];
}

export interface ProductMeta {
  filters: ProductFilters;
  totalPages: number;
  totalProducts: number;
  errorMessage?: string;
}

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filter: SearchParams) => [...productKeys.lists(), filter] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  searches: () => [...productKeys.all, "search"] as const,
  search: (name: string) => [...productKeys.searches(), name] as const,
  metadata: () => [...productKeys.all, "metadata"] as const,
};

export function useProductMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      createProductAction(prevState, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.metadata() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: number; data: FormData; prevState: any }) =>
      updateProductActionWrapper(
        variables.prevState,
        variables.id.toString(),
        variables.data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.metadata() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductAction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.metadata() });
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
