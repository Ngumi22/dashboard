// src/lib/api/carousels.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUniqueSuppliers } from "./fetch";
import { createSupplier } from "./post";

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["carousels"],
    queryFn: () => getUniqueSuppliers(),
  });
};

export const useAddSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      createSupplier(data, prevState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
    },
  });
};
