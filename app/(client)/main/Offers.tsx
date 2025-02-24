"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useCategoriesQuery,
  useCategoryProductQuery,
} from "@/lib/actions/Hooks/useCategory";
import { Flame } from "lucide-react";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";

export default function DiscountedOffers() {
  const { data: categories, isLoading: isCategoriesLoading } =
    useCategoriesQuery();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const mainCategories = useMemo(
    () => categories?.filter((category) => !category.parent_category_id) || [],
    [categories]
  );

  useEffect(() => {
    if (!activeTab && mainCategories.length > 0) {
      setActiveTab(mainCategories[0].category_name);
    }
  }, [mainCategories, activeTab]);

  const { data: categoryProducts, isLoading: isProductsLoading } =
    useCategoryProductQuery(activeTab ?? "");

  const tabs = useMemo(
    () =>
      mainCategories.map((category) => ({
        id: category.category_name,
        label: category.category_name,
        products:
          categoryProducts?.products
            ?.filter(
              (product) =>
                product.category_id.toString() ===
                category.category_id.toString()
            )
            ?.sort((a, b) => b.discount - a.discount)
            ?.slice(0, 5) || [],
      })),
    [mainCategories, categoryProducts]
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (isCategoriesLoading || isProductsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section>
      {activeTab && (
        <ScrollableTabbedSection
          title="Hot Deals"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          ProductCard={ProductCard}
          ProductCardSkeleton={ProductCardSkeleton}
        />
      )}
    </section>
  );
}
