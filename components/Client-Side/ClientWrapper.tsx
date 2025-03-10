// components/Client-Side/ClientWrapper.tsx
"use client";

import {
  QueryClientProvider,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { ReactNode } from "react";
import Loading from "@/app/(client)/loading";
import { getQueryClient } from "./get-query-client";
import { useBrandsQuery } from "@/lib/actions/Hooks/useBrand";
import {
  useCategoriesQuery,
  useFetchCategoryWithSubCategory,
} from "@/lib/actions/Hooks/useCategory";
import { useProductsQuery } from "@/lib/actions/Hooks/useProducts";
import { useBannersQuery } from "@/lib/actions/Hooks/useBanner";
import NewNavbar from "./Navbar/Navbar";
import Footer from "./Footer/footer";
import { memo } from "react";

interface ClientSideWrapperProps {
  children: ReactNode;
  dehydratedState: unknown;
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

const DataFetchingWrapper = memo(({ children }: { children: ReactNode }) => {
  const brandsQuery = useBrandsQuery();
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery(1, {});
  const bannersQuery = useBannersQuery();
  const categoriesWithSubQuery = useFetchCategoryWithSubCategory();

  const isLoading =
    brandsQuery.isFetching ||
    categoriesQuery.isFetching ||
    productsQuery.isFetching ||
    bannersQuery.isFetching ||
    categoriesWithSubQuery.isFetching;

  const isError =
    brandsQuery.isError ||
    categoriesQuery.isError ||
    productsQuery.isError ||
    bannersQuery.isError ||
    categoriesWithSubQuery.isError;

  const isSuccess =
    brandsQuery.isSuccess &&
    categoriesQuery.isSuccess &&
    productsQuery.isSuccess &&
    bannersQuery.isSuccess &&
    categoriesWithSubQuery.isSuccess;

  // Show loading until all queries are fully resolved
  if (isLoading || !isSuccess) {
    return <Loading />;
  }

  // Show error message if any query fails
  if (isError) {
    return <div>Error loading data. Please try again later.</div>;
  }

  return (
    <section className="mt-[9.5rem] lg:mt-[11.5rem]">
      <NewNavbar />
      {children}
      <Footer />
    </section>
  );
});

DataFetchingWrapper.displayName = "DataFetchingWrapper";
