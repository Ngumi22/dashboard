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
import { useEffect } from "react";
import Base64Image from "@/components/Data-Table/base64-image";
import {
  CalendarHeart,
  ReplaceAll,
  Sparkle,
  Sparkles,
  Truck,
} from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchCategoryWithSubCat } from "@/lib/actions/Category/fetch";
import { useFetchCategoryWithSubCategory } from "@/lib/actions/Hooks/useCategory";

export interface Category {
  category_id: number;
  category_name: string;
  category_image: string | null;
  category_description: string;
  category_status: "active" | "inactive";
  parent_category_id?: number | null;
}

export default function MegaMenu() {
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useFetchCategoryWithSubCategory();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching categories</div>;

  // Generate slugs for categories
  const categoriesWithSlugs =
    categoriesData?.map((category) => ({
      ...category,
      category_slug: generateSlug(category.category_name),
    })) || [];

  // Filter main categories (categories with no parent)
  const mainCategories = categoriesWithSlugs.filter(
    (category) => category.parent_category_id === null
  );

  // For each main category, filter out its subcategories
  const subcategories = (parentCategoryId: number) => {
    return categoriesWithSlugs.filter(
      (category) => category.parent_category_id === parentCategoryId
    );
  };

  return (
    <NavigationMenu className="md:flex items-center justify-center container hidden mx-auto flex-2">
      <div className="flex items-center gap-2">
        <Sparkles />
        <Link href="/special-offers" className="p-2 text-sm font-medium">
          Special Offers
        </Link>
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
              <div className="flex items-center justify-start gap-2 shadow-lg p-4 h-72">
                <div className="flex flex-col items-center w-1/5 bg-gray-100 p-4 h-full">
                  <h2 className="font-bold underline text-xl text-gray-900">
                    Good to know
                  </h2>
                  <ul className="flex flex-col justify-between space-y-4 h-full my-4 text-sm">
                    <li className="flex gap-2 items-center">
                      <ReplaceAll />
                      We accept returns
                    </li>
                    <li className="flex gap-2 items-center">
                      <Truck />
                      We have payment on delivery
                    </li>
                    <li className="flex gap-2 items-center">
                      <Sparkle />
                      Exclusive Deals
                    </li>
                    <li className="flex gap-2 items-center">
                      <CalendarHeart />
                      We offer 12 months Warranty
                    </li>
                  </ul>
                </div>
                <SelectSeparator />
                <div className="pr-8 w-4/5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-lg text-gray-900">
                      Categories
                    </p>
                    <Link
                      href={`/category/${category.category_id}`}
                      className="text-sm text-gray-900 font-bold underline underline-offset-1">
                      See all
                    </Link>
                  </div>
                  <div className="flex items-center justify-start gap-4 overflow-scroll scrollbar snap-mandatory my-2">
                    {/* Render subcategories for this main category */}
                    {subcategories(category.category_id).length > 0 ? (
                      subcategories(category.category_id).map((subItem) => (
                        <Link
                          key={subItem.category_id}
                          href={`/category/${category.category_id}/${subItem.category_id}`}
                          className="group block aspect-square space-y-5  my-auto items-center h-56">
                          <Base64Image
                            src={subItem.category_image || "/placeholder.svg"}
                            alt={subItem.category_name}
                            width={150}
                            height={150}
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
