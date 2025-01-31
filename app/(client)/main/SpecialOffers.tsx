"use client";

import { useStore } from "@/app/store";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import ProductCard from "@/components/Product/ProductCards/product-card";

import { useEffect } from "react";

export default function SpecialOffers() {
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProducts);

  useEffect(() => {
    if (!products || products.length === 0) {
      fetchProducts(1, {});
    }
  }, [fetchProducts, products]);

  return (
    <ScrollableSection
      title="Special Offers"
      items={products.map((product) => ({
        id: product.product_id,
        content: (
          <ProductCard
            images={{ mainImage: product.images.mainImage }}
            price={product.price}
            product_id={product.product_id}
            name={product.name}
            ratings={product.ratings}
            discount={product.discount}
            description={product.description}
            quantity={product.quantity}
          />
        ),
      }))}
      className="mb-8"
      itemClassName=""
    />
  );
}
