import { ProductsFilters } from "@/components/Products/products-filters";
import { ProductsGridClientWrapper } from "@/components/Products/products-grid-wrapper";
import { ProductsLoading } from "@/components/Products/products-loading";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";
import { SearchParams } from "@/lib/actions/Product/searchTypes";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const result = await fetchProducts(searchParams);
  const { products, filters, pagination } = result;
  const totalProducts = pagination.totalProducts;

  return (
    <div className="container mx-auto p-4 mt-40 md:mt-52">
      <div className="lg:grid lg:grid-cols-[280px_1fr] gap-8">
        <div className="mb-4 lg:mb-0">
          <ProductsFilters filters={filters} searchParams={searchParams} />
        </div>

        <div>
          <Suspense fallback={<ProductsLoading />}>
            <ProductsGridClientWrapper
              products={products}
              totalProducts={totalProducts}
              pagination={pagination}
              searchParams={searchParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
