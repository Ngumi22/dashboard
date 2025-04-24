import { ProductsFilters } from "@/components/Products/products-filters";
import { ProductsLoading } from "@/components/Products/products-loading";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";
import { SearchParams } from "@/lib/actions/Product/searchTypes";
import { Suspense } from "react";

import dynamic from "next/dynamic";

export const revalidate = 60; // Revalidate cache every 60s (better than force-dynamic)

const ProductsGridClientWrapper = dynamic(
  () =>
    import("@/components/Products/products-grid-wrapper").then(
      (mod) => mod.ProductsGridClientWrapper
    ),
  {
    ssr: false, // Load on client only
    loading: () => <ProductsLoading />, // Placeholder while loading
  }
);

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, filters, pagination } = await fetchProducts(searchParams);

  return (
    <div className="md:container mx-auto p-4 mt-[9.9rem] md:mt-[11.77rem]">
      <div className="lg:grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Filters Sidebar */}
        <div className="mb-4 lg:mb-0">
          <Suspense
            fallback={
              <div className="text-sm text-muted-foreground">
                Loading filters...
              </div>
            }>
            <ProductsFilters filters={filters} />
          </Suspense>
        </div>

        {/* Product Grid */}
        <div>
          <Suspense fallback={<ProductsLoading />}>
            <ProductsGridClientWrapper
              products={products}
              totalProducts={pagination.totalProducts}
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalProducts: pagination.totalProducts,
                perPage: pagination.perPage,
              }}
              searchParams={{
                page: searchParams.page,
                sort: searchParams.sort,
                filters: searchParams.filters,
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
