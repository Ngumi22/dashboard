"use client";

import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import { useProducts } from "@/lib/actions/Hooks/useProducts";
import { fetchProducts } from "@/lib/actions/Product/fetch";
import { Product } from "@/lib/actions/Product/productTypes";
import { useQuery } from "@tanstack/react-query";

import dynamic from "next/dynamic";

interface NewProductsProps {
  initialData?: any;
  currentPage?: number;
}

// Lazy load ProductCard
const ProductCard = dynamic(
  () => import("@/components/Product/ProductCards/product-card"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
  }
);

export default function NewProducts({
  initialData,
  currentPage,
}: NewProductsProps) {
  const {
    data: newproducts = initialData,
    isLoading,
    isError,
    error,
    refetch, // Allows retrying manually
  } = useQuery({
    queryKey: ["products", currentPage, {}], // Unique cache key
    queryFn: () => fetchProducts(currentPage ?? 1, {}),

    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });

  // Ensure categoryProducts has products before mapping
  const products = newproducts?.products || [];

  return (
    <ScrollableSection
      title="Newest Products"
      items={products.map((product: Product) => ({
        id: product.id,
        content: (
          <ProductCard
            main_image={product.main_image}
            price={product.price}
            id={product.id}
            name={product.name}
            discount={product.discount}
            description={product.description}
            quantity={product.quantity}
            ratings={product.ratings}
            created_at={product.created_at} // Ensure this is passed to ProductCard
          />
        ),
      }))}
      className="mb-8"
      itemClassName=""
    />
  );
}
