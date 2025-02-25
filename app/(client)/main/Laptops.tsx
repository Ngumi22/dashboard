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

  useEffect(() => {
    if (subCategories && subCategories.length > 0 && !subCategoryName) {
      setSubCategoryName(subCategories[0].category_name); // Set the first subcategory as default
    }
  }, [subCategories, subCategoryName]);

  // Memoize the tabs array
  const tabs = useMemo(() => {
    return (
      subCategories?.map((subCategory: any) => ({
        id: subCategory.category_name,
        label: subCategory.category_name,
        products:
          subCategoryProducts?.products?.filter(
            (product) => product.category_id === subCategory.category_id
          ) || [],
      })) || []
    );
  }, [subCategories, subCategoryProducts]);

  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : "");

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id); // Reset activeTab if it's not in the tabs array
    }
  }, [tabs, activeTab]);

  const handleTabChange = (tabId: string) => {
    setSubCategoryName(tabId); // Update the subcategory name when a tab is clicked
    setActiveTab(tabId); // Update the activeTab state
  };

  // Handle errors
  if (subCategoriesError || productsError) {
    return (
      <div className="text-center text-red-500">
        {subCategoriesError?.message || productsError?.message}
      </div>
    );
  }

  // Hide the component if no subcategories are found
  if (
    !isSubCategoriesLoading &&
    (!subCategories || subCategories.length === 0)
  ) {
    return null; // Hide the component
  }

  // Show loading state while data is being fetched
  if (isSubCategoriesLoading || isProductsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section>
      <ScrollableTabbedSection
        title={`Shop ${categoryName}`} // Dynamic title based on categoryName
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
