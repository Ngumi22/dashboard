import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createCarousel } from "./post";
import { updateCarouselAction } from "./update";
import { carouselKeys, carouselQueries } from "./services";
import { Carousel } from "./carouselTypes";
import { deleteCarousel } from "./fetch";

export function useCarousels() {
  const queryOptions = carouselQueries.all;

  return useQuery<Carousel[]>({
    ...queryOptions,
    // To prevent background refetches
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
}
export function useCarouselById(id: number) {
  return useQuery(carouselQueries.byId(id));
}

export function useCarouselMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({ prevState, data }: { prevState: any; data: FormData }) =>
      createCarousel(data, prevState),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.all });
    },
  });

  const update = useMutation({
    mutationFn: ({
      carousel_id,
      data,
    }: {
      carousel_id: number;
      data: FormData;
    }) => updateCarouselAction(carousel_id.toString(), data),
    onSuccess: (_, { carousel_id }) => {
      queryClient.invalidateQueries({
        queryKey: carouselKeys.detail(carousel_id),
      });
    },
  });

  const remove = useMutation({
    mutationFn: (carousel_id: number) => deleteCarousel(carousel_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carouselKeys.all });
    },
  });

  return {
    createCarousel: create.mutateAsync,
    updateCarousel: update.mutateAsync,
    deleteCarousel: remove.mutateAsync,
    isLoading: create.isPending || update.isPending || remove.isPending,
  };
}
