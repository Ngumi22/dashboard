"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getProducts, Product } from "@/lib/api";
import FilterSidebar from "@/components/Client-Side/Products/FilterSidebar";
import ProductsHeader from "@/components/Client-Side/Products/ProductsHeader";
import ProductsGrid from "@/components/Client-Side/Products/ProductsGrid";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsPerRow, setProductsPerRow] = useState("4");
  const [productsPerPage, setProductsPerPage] = useState("20");
  const [sortBy, setSortBy] = useState("popularity");

  useEffect(() => {
    const fetchProducts = async () => {
      const filters: Record<string, string | string[]> = {};
      searchParams.forEach((value, key) => {
        if (filters[key]) {
          if (Array.isArray(filters[key])) {
            (filters[key] as string[]).push(value);
          } else {
            filters[key] = [filters[key] as string, value];
          }
        } else {
          filters[key] = value;
        }
      });
      const fetchedProducts = await getProducts(filters);
      setProducts(fetchedProducts);
    };

    fetchProducts();
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <FilterSidebar />
          </div>
        </div>
        <div className="flex-1">
          <ProductsHeader
            onProductsPerRowChange={setProductsPerRow}
            onProductsPerPageChange={setProductsPerPage}
            onSortByChange={setSortBy}
          />
          <ProductsGrid
            products={products}
            productsPerRow={productsPerRow}
            productsPerPage={productsPerPage}
            sortBy={sortBy}
          />
        </div>
      </div>
    </div>
  );
}
