import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { ProductSortBar } from "./product-sort-bar";
import { parseSearchParams } from "@/lib/actions/Product/search-params";
import { getProducts } from "@/lib/actions/Product/sample";

export async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Parse search params into strongly typed object
  const parsedParams = parseSearchParams(searchParams);

  // Fetch products with parsed params
  const { products, totalProducts, totalPages } = await getProducts(
    parsedParams
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
      <ProductFilters searchParams={searchParams} />
      <div className="space-y-6">
        <ProductSortBar
          searchParams={searchParams}
          totalProducts={totalProducts}
        />
        <ProductGrid
          products={products}
          searchParams={searchParams}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
