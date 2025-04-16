import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onSubmitAction } from "./actions/post";
import { FormState, updateProductAction } from "./actions/update";
import { Product, SearchParams } from "./actions/search-params";
import { handleDeleteAction } from "./actions/delete";
import {
  productKeys,
  getProductListKey,
  getProductDetailKey,
  getProductNameKey,
} from "./services";
import {
  getProductById,
  getProductByName,
  getProductFilters,
  getProducts,
} from "./queries";

const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function useProducts(filter?: SearchParams) {
  return useQuery({
    queryKey: getProductListKey(filter),
    queryFn: () => getProducts(filter),
    select: (data) => data,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useProductFilters() {
  return useQuery({
    queryKey: productKeys.filters,
    queryFn: getProductFilters,
    staleTime: DAY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useProductById(id: number) {
  return useQuery<Product>({
    queryKey: getProductDetailKey(id),
    queryFn: () => getProductById(id),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useProductByName(name: string) {
  return useQuery<Product>({
    queryKey: getProductNameKey(name),
    queryFn: () => getProductByName(name),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      onSubmitAction(prevState, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists });
      queryClient.invalidateQueries({ queryKey: productKeys.filters });
    },
  });

  const update = useMutation({
    mutationFn: ({
      product_id,
      data,
      prevState,
    }: {
      product_id: string;
      data: FormData;
      prevState: FormState;
    }) => updateProductAction(prevState, product_id, data),
    onSuccess: (_, { product_id }) => {
      queryClient.invalidateQueries({
        queryKey: getProductDetailKey(Number(product_id)),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists });
    },
  });

  const remove = useMutation({
    mutationFn: (product_id: number) => handleDeleteAction(product_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists });
    },
  });

  return {
    createProduct: create.mutateAsync,
    updateProduct: update.mutateAsync,
    deleteProduct: remove.mutateAsync,
    isLoading: create.isPending || update.isPending || remove.isPending,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
