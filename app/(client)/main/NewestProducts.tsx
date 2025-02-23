"use client";

import { useCategoryProductQuery } from "@/lib/actions/Hooks/useCategory";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import ProductCard from "@/components/Product/ProductCards/product-card";

import { useProducts } from "@/lib/actions/Hooks/useProducts";
import { useProductFilters } from "@/app/store/ProductFilterStore";

export default function NewProducts() {
  const { setFilters } = useProductFilters();
  const { data, isLoading, error } = useProducts(1); // Fetch products for page 1

  // Ensure categoryProducts has products before mapping
  const products = data?.products || [];

  return (
    <ScrollableSection
      title="Newest Products"
      items={products.map((product) => ({
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
