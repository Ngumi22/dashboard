import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { updateSupplierAction } from "./update";

import { deleteSupplierAction } from "./delete";
import { Supplier } from "./supplierTypes";
import { supplierKeys, supplierQueries } from "./service";
import { createSupplier } from "./post";

export function useSuppliers() {
  return useQuery<Supplier[]>({
    ...supplierQueries.all,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useSupplierById(id: number) {
  return useQuery(supplierQueries.byId(id));
}

export function useSupplierMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      createSupplier(data, prevState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: supplierKeys.subSuppliers });
    },
  });

  const update = useMutation({
    mutationFn: ({
      supplier_id,
      data,
    }: {
      supplier_id: number;
      data: FormData;
    }) => updateSupplierAction(supplier_id.toString(), data),
    onSuccess: (_, { supplier_id }) => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(supplier_id),
      });
      queryClient.invalidateQueries({
        queryKey: supplierKeys.tree(supplier_id),
      });
      queryClient.invalidateQueries({
        queryKey: supplierKeys.subSuppliers,
      });
    },
  });

  const remove = useMutation({
    mutationFn: (supplier_id: string) => deleteSupplierAction(supplier_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      queryClient.invalidateQueries({ queryKey: supplierKeys.subSuppliers });
    },
  });

  return {
    createSupplier: create.mutateAsync,
    updateSupplier: update.mutateAsync,
    deleteSupplier: remove.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
}
