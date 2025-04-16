import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategorySubmitAction } from "./post";
import { updateCategoryAction } from "./update";
import { categoryKeys, categoryQueries } from "./services";
import { deleteCategory } from "./delete";
import { Category } from "./catType";

export function useCategories() {
  return useQuery<Category[]>({
    ...categoryQueries.all,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useSubCategories() {
  return useQuery<Category[]>({
    ...categoryQueries.subCategories,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useSubCategoriesById(category_id: number) {
  return useQuery({
    ...categoryQueries.subCategoriesById(category_id),
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}

export function useCategoryById(id: number) {
  return useQuery(categoryQueries.byId(id));
}

export function useCategoryTree(id: number) {
  return useQuery(categoryQueries.subCategoriesById(id));
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      CategorySubmitAction(prevState, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.subCategories });
    },
  });

  const update = useMutation({
    mutationFn: ({
      category_id,
      data,
    }: {
      category_id: number;
      data: FormData;
    }) => updateCategoryAction(category_id.toString(), data),
    onSuccess: (_, { category_id }) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(category_id),
      });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.tree(category_id),
      });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.subCategories,
      });
    },
  });

  const remove = useMutation({
    mutationFn: (category_id: number) => deleteCategory(category_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.subCategories });
    },
  });

  return {
    createCategory: create.mutateAsync,
    updateCategory: update.mutateAsync,
    deleteCategory: remove.mutateAsync,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
}
