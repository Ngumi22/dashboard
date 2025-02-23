"use client";

import { useProductFilters } from "@/app/store/ProductFilterStore";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import ProductCard from "@/components/Product/ProductCards/product-card";

import { useProducts } from "@/lib/actions/Hooks/useProducts";

export default function SpecialOffers() {
  const { filters } = useProductFilters();
  const { data, isLoading, error } = useProducts(1); // Fetch products for page 1

  const products = data?.products || [];

  // Extract brand_id from filters (if available)
  const filterBrandId = filters.brand; // Assuming filters.brand contains a brand_id string

  // Ensure category exists in product structure before filtering
  const topDiscountedProducts = products
    .filter(
      (p) => !filterBrandId || p.brand?.brand_id === filterBrandId // Match brand_id properly
    )
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 5);

  return (
    <ScrollableSection
      title="Special Offers"
      items={topDiscountedProducts.map((product) => ({
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
    />
  );
}
