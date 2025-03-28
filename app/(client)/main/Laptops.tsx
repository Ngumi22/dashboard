"use client";

import { useState, useEffect, useMemo } from "react";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import {
  useFetchProductsBySubCategory,
  useFetchSubCategories,
} from "@/lib/actions/Hooks/useCategory";

interface SubCategoryProductsProps {
  categoryName: string;
}

export default function SubCategoryProducts({
  categoryName,
}: SubCategoryProductsProps) {
  const [subCategoryName, setSubCategoryName] = useState<string>("");
  const {
    data: subCategories,
    isLoading: isSubCategoriesLoading,
    error: subCategoriesError,
  } = useFetchSubCategories(categoryName);
  const {
    data: subCategoryProducts,
    isLoading: isProductsLoading,
    error: productsError,
  } = useFetchProductsBySubCategory(subCategoryName);

  // Find the first subcategory that has products
  const getFirstSubcategoryWithProducts = (
    subCategories: any[],
    products: any
  ) => {
    for (const subCategory of subCategories) {
      const hasProducts = products?.products?.some(
        (product: { category_id: any }) =>
          product.category_id === subCategory.category_id
      );
      if (hasProducts) {
        return subCategory.category_name;
      }
    }
    return subCategories[0]?.category_name || ""; // Fallback to first subcategory if none have products
  };

  useEffect(() => {
    if (subCategories && subCategories.length > 0 && !subCategoryName) {
      setSubCategoryName(
        getFirstSubcategoryWithProducts(subCategories, subCategoryProducts)
      );
    }
  }, [subCategories, subCategoryProducts, subCategoryName]);

  // Memoized tabs to avoid recalculations
  const tabs = useMemo(() => {
    return (
      subCategories
        ?.map((subCategory: any) => ({
          id: subCategory.category_name,
          label: subCategory.category_name,
          products:
            subCategoryProducts?.products?.filter(
              (product: { category_id: any }) =>
                product.category_id === subCategory.category_id
            ) || [],
        }))
        .filter((tab) => tab.products.length > 0) || [] // Ensure only categories with products are shown
    );
  }, [subCategories, subCategoryProducts]);

  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : "");

  // Update activeTab dynamically
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id); // Ensure a valid tab is always selected
    }
  }, [tabs, activeTab]);

  const handleTabChange = (tabId: string) => {
    setSubCategoryName(tabId);
    setActiveTab(tabId);
  };

  if (subCategoriesError || productsError) {
    return (
      <div className="text-center text-red-500">
        {subCategoriesError?.message || productsError?.message}
      </div>
    );
  }

  if (
    !isSubCategoriesLoading &&
    (!subCategories || subCategories.length === 0)
  ) {
    return null; // Hide if no subcategories exist
  }

  if (isSubCategoriesLoading || isProductsLoading) {
    return (
      <div className="grid grid-flow-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <section>
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
