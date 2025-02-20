"use client";

import { useStore } from "@/app/store";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import ProductCard from "@/components/Product/ProductCards/product-card";

import { useEffect } from "react";

export default function NewestProducts() {
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProductsState);

  useEffect(() => {
    if (!products || products.length === 0) {
      fetchProducts(1, {});
    }
  }, [fetchProducts, products]);

  return (
    <ScrollableSection
      title="Latest Products"
      items={products.map((product) => ({
        id: product.id,
        content: (
          <ProductCard
            main_image={product.main_image}
            price={product.price}
            id={String(product.id)}
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
