"use client";

import { useState } from "react";
import Loading from "@/app/(client)/loading";
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query";
import {
  useBrandProductsQuery,
  useBrandsQuery,
} from "@/lib/actions/Hooks/useBrand";
import {
  useCategoriesQuery,
  useCategoryProductQuery,
  useFetchProductsBySubCategory,
  useFetchSubCategories,
} from "@/lib/actions/Hooks/useCategory";
import { useProductsQuery } from "@/lib/actions/Hooks/useProducts";

export default function ClientSideWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <DataFetchingWrapper>{children}</DataFetchingWrapper>
    </QueryClientProvider>
  );
}

function DataFetchingWrapper({ children }: { children: React.ReactNode }) {
  const brandsQuery = useBrandsQuery();
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery(1, {}); // Adjust the arguments as needed

  // Add other queries as needed
  const brandProductsQuery = useBrandProductsQuery("HP"); // Adjust the argument as needed
  const categoryProductQuery = useCategoryProductQuery("Laptops"); // Adjust the argument as needed
  const subCategoriesQuery = useFetchSubCategories("Laptops"); // Adjust the argument as needed
  const subCategoryProductsQuery = useFetchProductsBySubCategory("SmartPhones"); // Adjust the argument as needed

  const isLoading =
    brandsQuery.isLoading ||
    categoriesQuery.isLoading ||
    productsQuery.isLoading ||
    brandProductsQuery.isLoading ||
    categoryProductQuery.isLoading ||
    subCategoriesQuery.isLoading ||
    subCategoryProductsQuery.isLoading;

  if (isLoading) {
    return <Loading />; // Show loading spinner or skeleton UI
  }

  return <section className="mt-[9.5rem] lg:mt-[11.5rem]">{children}</section>;
}
