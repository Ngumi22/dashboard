"use client";
import { useStore } from "@/app/store";

import React, { useEffect, useState } from "react";

import { Heart, Share2, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/Product/card";

export default function ProductShowcase() {
  const fetchProducts = useStore((state) => state.fetchProducts);

  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts(currentPage, {}); // Fetch initial page
  }, [fetchProducts, currentPage]);

  return (
    <div className="container mx-auto p-4 w-1/4">
      <h1 className="text-3xl font-bold mb-6">Product Showcase</h1>
      <div className="grid grid-cols-1 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            imageSrc={`data:image/jpeg;base64,${product.images.mainImage}`}
            imageAlt={product.name}
            title={product.description}
            description={product.description}
            price={String(product.price)}
            rating={product.ratings}
            ratingCount={75}
            actionLabel="Learn More"
            onActionClick={() =>
              console.log("Navigating to Smartwatch details")
            }
            className="bg-gray-100"
            titleClassName="text-blue-600"
            actionClassName="bg-green-600 hover:bg-green-700"
            actions={[
              {
                icon: <Heart className="w-5 h-5" />,
                label: "Add to Wishlist",
                onClick: () => console.log("Added to Wishlist"),
              },
              {
                icon: <Share2 className="w-5 h-5" />,
                label: "Share",
                onClick: () => console.log("Shared"),
              },
            ]}
            orientation="horizontal"
          />
        ))}
      </div>
    </div>
  );
}
