"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";
import type { Product } from "@/lib/actions/Product/actions/search-params";

type ProductBrand = {
  id: string | number;
  name: string;
  products: Product[];
  image?: string;
};

type ShopByBrandProps = {
  initialData?: ProductBrand[];
  maxProductsPerBrand?: number;
  sortBy?: "discount" | "price" | "rating" | "newest";
};

export default function ShopByBrand({
  maxProductsPerBrand = 5,
  sortBy = "discount",
}: ShopByBrandProps) {
  const {
    data: brands = [],
    isLoading,
    isError,
    error,
  } = useQuery<ProductBrand[]>({
    queryKey: ["brand-products"],
    queryFn: async () => {
      try {
        const result = await fetchProducts({
          metadataOnly: false,
          perPage: 100,
        });

        if (!result) {
          throw new Error("No response from API");
        }
        const brandMap = new Map<string | number, ProductBrand>();

        result.products.forEach((product) => {
          if (!product.brand_name) return;

          const brandId = product.brand_id || product.brand_name;
          const brandName = product.brand_name;

          if (!brandMap.has(brandId)) {
            brandMap.set(brandId, {
              id: brandId,
              name: brandName,
              products: [],
            });
          }

          brandMap.get(brandId)?.products.push(product);
        });

        const brandsArray = Array.from(brandMap.values());

        if (brandsArray.length === 0) {
          console.warn("No brands found in products");
        }

        return brandsArray;
      } catch (error) {
        console.error("Error fetching products by brand:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);
  useEffect(() => {
    if (brands.length > 0 && !activeTab) {
      setActiveTab(brands[0].name);
    }
  }, [brands, activeTab]);
  const tabs = useMemo(() => {
    return brands.map((brand) => {
      let sortedProducts = [...brand.products];

      switch (sortBy) {
        case "discount":
          sortedProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
          break;
        case "price":
          sortedProducts.sort((a, b) => a.price - b.price);
          break;
        case "rating":
          sortedProducts.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
          break;
        case "newest":
          sortedProducts.sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
          );
          break;
        default:
          break;
      }

      return {
        id: brand.name,
        label: brand.name,
        products: sortedProducts
          .slice(0, maxProductsPerBrand)
          .map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount,
            ratings: product.ratings,
            category_id: String(product.category_id || ""),
            description: product.description || "",
            main_image: product.main_image || "",
            quantity: product.quantity || 0,
            created_at: product.created_at || "",
          })),
        image: brand.image,
      };
    });
  }, [brands, sortBy, maxProductsPerBrand]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);
  if (isLoading && !brands?.length) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Shop By Brand</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }
  if (isError) {
    return (
      <div className="text-center space-y-2 py-4">
        <p className="text-red-500">
          {error instanceof Error ? error.message : "Failed to load brands"}
        </p>
      </div>
    );
  }
  if (!brands.length) {
    return null;
  }

  return (
    <section className="mb-12">
      <ScrollableTabbedSection
        title="Shop By Brand"
        tabs={tabs}
        activeTab={activeTab ?? tabs[0]?.id}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
