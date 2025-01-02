"use client";
import { useStore } from "@/app/store";
import ProductCard from "@/components/Product/ProductCards/product-card";

import { useEffect, useState } from "react";

export default function All() {
  const fetchProducts = useStore((state) => state.fetchProducts);

  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts(currentPage, {}); // Fetch initial page
  }, [fetchProducts, currentPage]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          product_id={product.product_id}
          key={product.product_id}
          name={product.name}
          description={product.description}
          price={product.price}
          images={{ main_image: product.images.mainImage ?? "" }}
          rating={product.ratings}
          discountPercentage={product.discount}
        />
      ))}
    </div>
  );
}
