"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import Loading from "@/app/(client)/loading";
import { getQueryClient } from "./get-query-client";
import { useBrandsQuery } from "@/lib/actions/Hooks/useBrand";
import { useCategoriesQuery } from "@/lib/actions/Hooks/useCategory";
import { useProductsQuery } from "@/lib/actions/Hooks/useProducts";
import { useBannersQuery } from "@/lib/actions/Hooks/useBanner";

export default function ClientSideWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DataFetchingWrapper>{children}</DataFetchingWrapper>
    </QueryClientProvider>
  );
}

function DataFetchingWrapper({ children }: { children: ReactNode }) {
  // Use the React Query hooks instead of server actions
  const brandsQuery = useBrandsQuery();
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery(1, {}); // Adjust arguments as needed

  // Check if any query is still loading
  const isLoading =
    brandsQuery.isLoading ||
    categoriesQuery.isLoading ||
    productsQuery.isLoading;

  if (isLoading) {
    return <Loading />;
  }

  return <section className="mt-[9.5rem] lg:mt-[11.5rem]">{children}</section>;
}
