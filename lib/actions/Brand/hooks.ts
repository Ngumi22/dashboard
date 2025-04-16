import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addBrand } from "./post";
import { updateBrandAction } from "./update";
import { Brand } from "./brandType";
import { brandKeys, brandQueries } from "./services";
import { deleteBrandAction } from "./delete";

export function useBrands() {
  return useQuery<Brand[]>({
    ...brandQueries.all,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useBrandById(id: number) {
  return useQuery(brandQueries.byId(id));
}

export function useBrandMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      addBrand(data, prevState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      queryClient.invalidateQueries({ queryKey: brandKeys.subBrands });
    },
  });

  const update = useMutation({
    mutationFn: ({ brand_id, data }: { brand_id: number; data: FormData }) =>
      updateBrandAction(brand_id.toString(), data),
    onSuccess: (_, { brand_id }) => {
      queryClient.invalidateQueries({
        queryKey: brandKeys.detail(brand_id),
      });
      queryClient.invalidateQueries({
        queryKey: brandKeys.tree(brand_id),
      });
      queryClient.invalidateQueries({
        queryKey: brandKeys.subBrands,
      });
    },
  });

  const remove = useMutation({
    mutationFn: (brand_id: number) => deleteBrandAction(brand_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      queryClient.invalidateQueries({ queryKey: brandKeys.subBrands });
    },
  });

  return {
    createBrand: create.mutateAsync,
    updateBrand: update.mutateAsync,
    deleteBrand: remove.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
}
