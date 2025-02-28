// components/Client-Side/ClientWrapper.tsx
"use client";

import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { ReactNode } from "react";
import Loading from "@/app/(client)/loading";
import { getQueryClient } from "./get-query-client";
import { useBrandsQuery } from "@/lib/actions/Hooks/useBrand";
import { useCategoriesQuery } from "@/lib/actions/Hooks/useCategory";
import { useProductsQuery } from "@/lib/actions/Hooks/useProducts";
import { useBannersQuery } from "@/lib/actions/Hooks/useBanner";

interface ClientSideWrapperProps {
  children: ReactNode;
  dehydratedState: unknown; // Use a more specific type if available
}

export default function ClientSideWrapper({
  children,
  dehydratedState,
}: ClientSideWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <DataFetchingWrapper>{children}</DataFetchingWrapper>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

function DataFetchingWrapper({ children }: { children: ReactNode }) {
  const brandsQuery = useBrandsQuery();
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery(1, {});
  const bannersQuery = useBannersQuery();

  // Handle errors
  if (
    brandsQuery.isError ||
    categoriesQuery.isError ||
    productsQuery.isError ||
    bannersQuery.isError
  ) {
    return <div>Error loading data. Please try again later.</div>;
  }

  // Check loading state
  const isLoading =
    brandsQuery.isLoading ||
    categoriesQuery.isLoading ||
    productsQuery.isLoading ||
    bannersQuery.isLoading;

  if (isLoading) {
    return <Loading />;
  }

  return <section className="mt-[9.5rem] lg:mt-[11.5rem]">{children}</section>;
}
