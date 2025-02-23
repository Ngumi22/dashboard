"use client";

import { useCategoryProductQuery } from "@/lib/actions/Hooks/useCategory";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import ProductCard from "@/components/Product/ProductCards/product-card";

export default function Laptops() {
  const categoryName = "Laptops"; // Directly use "Laptops"
  const { data: categoryProducts, isLoading: isProductsLoading } =
    useCategoryProductQuery(categoryName);

  if (isProductsLoading) {
    return <div>Loading...</div>;
  }

  // Ensure categoryProducts has products before mapping
  const products = categoryProducts?.products || [];

  return (
    <ScrollableSection
      title="Laptops"
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
          />
        ),
      }))}
      className="mb-8"
      itemClassName=""
    />
  );
}
