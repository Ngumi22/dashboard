import { ProductViewProvider } from "@/components/Client-Side/Products/product-view-context";
import { ProductsPage } from "@/components/Client-Side/Products/products-page";
import { ProductsPageSkeleton } from "@/components/Client-Side/Products/products-page-skeleton";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <ProductViewProvider>
        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsPage searchParams={searchParams} />
        </Suspense>
      </ProductViewProvider>
    </div>
  );
}
