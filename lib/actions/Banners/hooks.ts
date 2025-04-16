import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannerQueries, bannerKeys } from "./services";
import { createBanner } from "./post";
import { updateBannerAction } from "./update";
import { deleteBanner } from "./delete";
import { Banner } from "./bannerType";

export function useBanners(context?: string) {
  const queryOptions = context
    ? bannerQueries.byContext(context)
    : bannerQueries.all;

  return useQuery<Banner[]>({
    ...queryOptions,
    // To prevent background refetches
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}
export function useBannerById(id: number) {
  return useQuery(bannerQueries.byId(id));
}

export function useUsageContexts() {
  return useQuery(bannerQueries.contexts);
}

export function useBannerMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: FormData) => createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });

  const update = useMutation({
    mutationFn: ({ banner_id, data }: { banner_id: number; data: FormData }) =>
      updateBannerAction(banner_id.toString(), data),
    onSuccess: (_, { banner_id }) => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(banner_id) });
    },
  });

  const remove = useMutation({
    mutationFn: (banner_id: number) => deleteBanner(banner_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.all });
    },
  });

  return {
    createBanner: create.mutateAsync,
    updateBanner: update.mutateAsync,
    deleteBanner: remove.mutateAsync,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
}
