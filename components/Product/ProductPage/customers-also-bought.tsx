"use client";

import { MinimalProduct } from "@/app/store/cart";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import { Product } from "@/lib/actions/Product/productTypes";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductsAndFilters } from "@/lib/actions/Product/fetchByFilters";
import dynamic from "next/dynamic";

interface CustomersAlsoBoughtProps {
  currentProductId: number;
  currentProductCategory: string;
  currentProductTags?: string[];
  maxItems?: number;
}

// Lazy load ProductCard
const ProductCard = dynamic(
  () => import("@/components/Product/ProductCards/product-card"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
  }
);
const STALE_TIME = 1000 * 60 * 5; // 5 minutes
export default function CustomersAlsoBought({
  currentProductId,
  currentProductCategory,
  currentProductTags = [],
  maxItems = 4,
}: CustomersAlsoBoughtProps) {
  // Fetch potential related products
  const { data, isLoading } = useQuery({
    queryKey: ["customers-also-bought", currentProductCategory],
    queryFn: () =>
      fetchProductsAndFilters({
        category: currentProductCategory,
        page: 1,
        perPage: 20, // Fetch more to have better selection
      }),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  // Recommendation algorithm
  const getRecommendedProducts = (products: MinimalProduct[] = []) => {
    return products
      .filter((product) => product.id !== currentProductId) // Exclude current product
      .map((product) => {
        // Score products based on relevance
        let score = 0;

        // Higher score for same category
        if (product.category_name === currentProductCategory) score += 2;

        // Score for shared tags
        const sharedTags =
          product.tags?.filter((tag) => currentProductTags.includes(tag))
            .length || 0;
        score += sharedTags;

        // Bonus for discounted items
        if (product.discount && product.discount > 0) score += 1;

        // Bonus for highly rated items
        if (product.ratings && product.ratings >= 4) score += 1;

        return { ...product, score };
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, maxItems); // Take top recommendations
  };

  const recommendedProducts = getRecommendedProducts(data?.products);

  if (isLoading)
    return (
      <div className="mt-12 mb-16">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-none w-[280px] h-[380px] bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );

  if (recommendedProducts.length === 0) return null;

  return (
    <ScrollableSection
      title="Frequently bought together"
      items={recommendedProducts.map((product: MinimalProduct) => ({
        id: product.id,
        content: (
          <ProductCard
            key={product.id}
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
      itemClassName="w-64"
    />
  );
}
