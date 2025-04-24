"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { Product } from "@/lib/actions/Product/actions/search-params";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";

type Category = {
  id: string | number;
  name: string;
  parentId: string | number | null;
  description?: string;
  status?: string;
};

type SubCategoryProductsProps = {
  categoryName: string;
  initialData?: {
    subCategories: {
      name: string;
      products: Product[];
    }[];
  };
};

export default function SubCategoryProducts({
  categoryName,
  initialData,
}: SubCategoryProductsProps) {
  const {
    data: categoryData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [`category-products:${categoryName}`, categoryName],
    queryFn: async () => {
      try {
        const result = await fetchProducts({
          metadataOnly: true,
        });
        const rawCategories = result?.filters?.categories || [];
        const categories: Category[] = rawCategories.map((c: any) => ({
          id: c.category_id || c.id,
          name: c.category_name || c.name,
          parentId: c.parent_category_id || c.parentId,
          description: c.category_description || c.description,
          status: c.category_status || c.status,
        }));
        if (!categories.length) {
          throw new Error("No categories received from API");
        }
        const normalizedCategoryName = categoryName.toLowerCase().trim();
        const mainCategory = categories.find(
          (c) => c.name?.toLowerCase()?.trim() === normalizedCategoryName
        );

        if (!mainCategory) {
          const availableCategories = categories
            .map((c) => c.name)
            .filter(Boolean)
            .join(", ");
          throw new Error(
            `Category "${categoryName}" not found. Available categories: ${availableCategories}`
          );
        }

        const subCategories = categories.filter(
          (c) => String(c.parentId) === String(mainCategory.id)
        );

        if (subCategories.length === 0) {
          return { subCategories: [] };
        }
        const subCategoriesWithProducts = await Promise.all(
          subCategories.map(async (subCategory) => {
            try {
              const productsResult = await fetchProducts({
                category: subCategory.name,
                perPage: 10,
              });
              return {
                name: subCategory.name,
                products: productsResult?.products || [],
              };
            } catch (error) {
              console.error(
                `Error fetching products for ${subCategory.name}:`,
                error
              );
              return {
                name: subCategory.name,
                products: [],
              };
            }
          })
        );

        const filteredSubCategories = subCategoriesWithProducts.filter(
          (sc) => sc.products.length > 0
        );

        return {
          subCategories: filteredSubCategories,
        };
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    initialData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const tabs = useMemo(() => {
    return (
      categoryData?.subCategories
        ?.filter((sc) => sc?.name && sc?.products) // Filter out invalid entries
        ?.map((subCategory) => ({
          id: subCategory.name,
          label: subCategory.name,
          products: (subCategory.products || []).map((product) => ({
            ...product,
            category_id: String(product?.category_id || ""),
          })),
        })) || []
    );
  }, [categoryData]);

  const [activeTab, setActiveTab] = useState<string>(() => tabs[0]?.id || "");

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab?.id === activeTab)) {
      setActiveTab(tabs[0]?.id || "");
    }
  }, [tabs, activeTab]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (isError) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 font-medium">
          {error instanceof Error ? error.message : "Failed to load products"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!categoryData || !tabs.length) {
    return null;
  }

  return (
    <section className="mb-12">
      <ScrollableTabbedSection
        title={`Shop ${categoryName}`}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
