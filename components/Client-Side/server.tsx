import { getUniqueBrands } from "@/lib/actions/Brand/fetch";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";
import { fetchProducts } from "@/lib/actions/Product/fetch";
import { getUniqueCategories } from "@/lib/actions/Category/fetch";
import { SearchParams } from "@/lib/definitions";

export default async function getServerSideProps() {
  // Create a new QueryClient instance for the server
  const queryClient = getQueryClient();

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["brands"],
    queryFn: getUniqueBrands,
  });
  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: getUniqueCategories,
  });
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(1, {} as SearchParams),
  });

  // Dehydrate the query client to send data to the client
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
