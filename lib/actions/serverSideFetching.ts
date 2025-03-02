import { getQueryClient } from "@/components/Client-Side/get-query-client";
import { dehydrate } from "@tanstack/react-query";
import { getUniqueBrands } from "./Brand/fetch";
import { fetchCategoryWithSubCat, getUniqueCategories } from "./Category/fetch";
import { fetchProducts } from "./Product/fetch";
import { fetchCarousels } from "./Carousel/fetch";
import { getUniqueBanners } from "./Banners/fetch";
import { fetchProductsByTag } from "./Product/fetchByTag";

export async function prefetchData() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["carouselsData"],
      queryFn: fetchCarousels,
    }),
    queryClient.prefetchQuery({
      queryKey: ["bannersData"],
      queryFn: getUniqueBanners,
    }),
    queryClient.prefetchQuery({
      queryKey: ["brandData"],
      queryFn: getUniqueBrands,
    }),
    queryClient.prefetchQuery({
      queryKey: ["categoryData"],
      queryFn: getUniqueCategories,
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", 1, {}],
      queryFn: () => fetchProducts(1, {}),
    }),
    queryClient.prefetchQuery({
      queryKey: ["categoryDataWithSub"],
      queryFn: () => fetchCategoryWithSubCat(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["tagProducts"],
      queryFn: ({ queryKey }) => fetchProductsByTag(queryKey[1] as string),
    }),
  ]);

  return dehydrate(queryClient);
}
