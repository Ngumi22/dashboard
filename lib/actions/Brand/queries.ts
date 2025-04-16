// src/lib/api/brands.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUniqueBrands } from "./fetch";
import { addBrand } from "./post";
import { updateBrandAction } from "./update";
import { deleteBrandAction } from "./delete";

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => getUniqueBrands(),
  });
};

export const useAddBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      addBrand(data, prevState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brand_id, data }: { brand_id: string; data: FormData }) =>
      updateBrandAction(brand_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brand_id: number) => deleteBrandAction(brand_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
