import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onSubmitAction } from "./actions/post";
import { updateProductAction } from "./actions/update";
import { handleDeleteAction } from "./actions/delete";

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      onSubmitAction(prevState, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      product_id,
      data,
      prevState,
    }: {
      product_id: string;
      data: FormData;
      prevState: any;
    }) => updateProductAction(prevState, product_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product_id: number) => handleDeleteAction(product_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
