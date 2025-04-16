import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "./delete";
import { CategorySubmitAction } from "./post";
import { updateCategoryAction } from "./update";
import {
  fetchCategoryWithSubCat,
  fetchCategoryWithSubCatByCatId,
  getUniqueCategories,
} from "./get";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getUniqueCategories(),
  });
};

export const useSubCategories = () => {
  return useQuery({
    queryKey: ["sub-categories"],
    queryFn: () => fetchCategoryWithSubCat(),
  });
};

export const useSubCategoriesWithCatId = (category_id: number) => {
  return useQuery({
    queryKey: ["sub-categories", category_id], // Changed query key structure
    queryFn: () => fetchCategoryWithSubCatByCatId(category_id),
    enabled: !!category_id,
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      CategorySubmitAction(prevState, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      category_id,
      data,
    }: {
      category_id: string;
      data: FormData;
    }) => updateCategoryAction(category_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category_id: number) => deleteCategory(category_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
