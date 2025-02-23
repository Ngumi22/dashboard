"use client";

import { useState, useEffect } from "react";
import {
  useCategoriesQuery,
  useCategoryProductQuery,
} from "@/lib/actions/Hooks/useCategory";
import TabbedScrollableSection from "@/components/Client-Side/Features/TabbedScrollableSection";

export default function ShopByCategory() {
  const [categoryName, setCategoryName] = useState<string | null>(null); // Track selected category
  const { data: categories, isLoading: isCategoriesLoading } =
    useCategoriesQuery(); // Fetch all categories
  const { data: categoryProducts, isLoading: isProductsLoading } =
    useCategoryProductQuery(categoryName || "Laptops"); // Fetch products for the selected category

  // Filter only main categories (where parent_category_id is null)
  const mainCategories =
    categories?.filter((category) => !category.parent_category_id) || [];

  // Set the default category when main categories are fetched
  useEffect(() => {
    if (mainCategories.length > 0 && !categoryName) {
      setCategoryName(mainCategories[0].category_name);
    }
  }, [mainCategories, categoryName]);

  // Transform data for TabbedScrollableSection
  const transformedCategories = mainCategories.map((category) => {
    // Check if the current category matches the selected category
    const isSelectedCategory = category.category_name === categoryName;

    // If it's the selected category, include its products; otherwise, include an empty array
    const products = isSelectedCategory
      ? categoryProducts?.products?.map((product) => ({
          ...product,
          name: product.name || "",
          ratings: product.ratings || 0,
          main_image: product.main_image || "",
          quantity: product.quantity || 0,
          description: product.description || "",
          discount: product.discount || 0,
          price: product.price || 0,
          category_id: product.category_id || "",
        })) || []
      : [];

    return {
      name: category.category_name,
      products,
    };
  });

  if (isCategoriesLoading || isProductsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section>
      <h1 className="text-xl font-bold mb-8">Shop By Category</h1>
      <TabbedScrollableSection
        categories={transformedCategories}
        className="mb-8"
        itemClassName="w-[250px]"
        onCategorySelect={setCategoryName} // Update selected category
      />
    </section>
  );
}
