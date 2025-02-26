"use client";

import { useEffect } from "react";
import Loading from "@/app/(client)/loading";
import { QueryClientProvider, useQueries } from "@tanstack/react-query";

import { useQueryClient } from "@tanstack/react-query";
import { getUniqueBrands } from "@/lib/actions/Brand/fetch";
import { getUniqueCategories } from "@/lib/actions/Category/fetch";
import { fetchProducts } from "@/lib/actions/Product/fetch";
import { getQueryClient } from "./get-query-client";

function PrefetchData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["brands"],
      queryFn: getUniqueBrands,
    });
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: getUniqueCategories,
    });
    queryClient.prefetchQuery({
      queryKey: ["products", 1, {}],
      queryFn: () => fetchProducts(1, {}),
    });
  }, [queryClient]);

  return null;
}

function DataFetchingWrapper({ children }: { children: React.ReactNode }) {
  const results = useQueries({
    queries: [
      { queryKey: ["brands"], queryFn: getUniqueBrands },
      { queryKey: ["categories"], queryFn: getUniqueCategories },
      { queryKey: ["products", 1, {}], queryFn: () => fetchProducts(1, {}) },
    ],
  });

  const isLoading = results.some((result) => result.isLoading);

  if (isLoading) {
    return <Loading />;
  }

  return <section className="mt-[9.5rem] lg:mt-[11.5rem]">{children}</section>;
}

export default function ClientSideWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <PrefetchData />
      <DataFetchingWrapper>{children}</DataFetchingWrapper>
    </QueryClientProvider>
  );
}
