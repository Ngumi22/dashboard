"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { SelectSeparator } from "@/components/ui/select";
import { useStore } from "@/app/store";
import { useEffect } from "react";
import Base64Image from "@/components/Data-Table/base64-image";
import { Sparkles } from "lucide-react";
import { generateSlug } from "@/lib/utils";

export interface Category {
  category_id: number;
  category_name: string;
  category_image: string | null;
  category_description: string;
  category_status: "active" | "inactive";
  parent_category_id?: number | null;
}

export default function MegaMenu() {
  const fetchUniqueCategoriesWithSubs = useStore(
    (state) => state.fetchUniqueCategoriesWithSubs
  );
  const categoriesData = useStore((state) => state.categories);

  useEffect(() => {
    fetchUniqueCategoriesWithSubs(); // Fetch initial categories
  }, [fetchUniqueCategoriesWithSubs]);

  // Generate slugs for categories
  const categoriesWithSlugs = categoriesData.map((category) => ({
    ...category,
    category_slug: generateSlug(category.category_name),
  }));

  // Filter main categories (categories with no parent)
  const mainCategories = categoriesData.filter(
    (category) => category.parent_category_id === null
  );

  // For each main category, filter out its subcategories
  const subcategories = (parentCategoryId: number) => {
    return categoriesData.filter(
      (category) => category.parent_category_id === parentCategoryId
    );
  };

  return (
    <NavigationMenu className="md:flex items-center justify-center container hidden mx-auto flex-2">
      <div className="flex items-center gap-2">
        <Sparkles />
        <Link href="/special-offers">Special Offers</Link>
      </div>
      <NavigationMenuList className="">
        {mainCategories.map((category) => (
          <NavigationMenuItem key={category.category_id}>
            {/* Main Category Link */}
            <Link href={`/category/${category.category_id}`} passHref>
              <NavigationMenuTrigger className="h-12 text-black">
                {category.category_name}
              </NavigationMenuTrigger>
            </Link>
            <NavigationMenuContent>
              <div className="flex items-center justify-start gap-2 shadow-lg px-4 py-6 h-fit">
                <div className="flex flex-col items-start w-1/5 bg-gray-100 px-4 py-6">
                  <h2 className="font-bold text-center">Good to know</h2>
                  <ol>
                    <li>
                      <p>We accept returns</p>
                    </li>
                    <li>
                      <p>We have payment on delivery</p>
                    </li>
                    <li>
                      <p>We offer free delivery </p>
                    </li>
                  </ol>
                </div>
                <SelectSeparator />
                <div className="pr-8 w-4/5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-gray-700">Categories</p>
                    <Link
                      href={`/category/${category.category_id}`}
                      className="text-sm text-gray-900 hover:underline">
                      See all
                    </Link>
                  </div>
                  <div className="flex flex-nowrap md:flex-wrap items-center justify-start gap-x-4">
                    {/* Render subcategories for this main category */}
                    {subcategories(category.category_id).length > 0 ? (
                      subcategories(category.category_id).map((subItem) => (
                        <Link
                          key={subItem.category_id}
                          href={`/category/${category.category_id}/${subItem.category_id}`}
                          className="group block aspect-square space-y-5">
                          <Base64Image
                            src={subItem.category_image || "/placeholder.svg"}
                            alt={subItem.category_name}
                            width={100}
                            height={100}
                          />
                          <h3 className="text-sm font-medium text-gray-900">
                            {subItem.category_name}
                          </h3>
                        </Link>
                      ))
                    ) : (
                      <p>No subcategories available</p>
                    )}
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
