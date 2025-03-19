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
import Image from "next/image";
import {
  ArrowRight,
  CalendarHeart,
  ReplaceAll,
  Sparkle,
  Sparkles,
  Truck,
} from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { useFetchCategoryWithSubCategory } from "@/lib/actions/Hooks/useCategory";
import { Button } from "@/components/ui/button";

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
    <NavigationMenu className="">
      <div className="hidden md:flex items-center gap-2">
        <Sparkles />
        <Link href="/special-offers" className="p-2 text-sm font-medium">
          Special Offers
        </Link>
      </div>
      <NavigationMenuList className="grid grid-flow-row md:grid-flow-col">
        {mainCategories.map((category) => (
          <NavigationMenuItem key={category.category_id}>
            {/* Main Category Link */}
            <Link
              href={`/products?category=${encodeURIComponent(
                category.category_name
              )}`}
              passHref>
              <NavigationMenuTrigger className="h-12 text-black">
                {category.category_name}
              </NavigationMenuTrigger>
            </Link>
            <NavigationMenuContent className="hidden md:flex flex-col md:flex-row items-center justify-start gap-2 shadow-lg md:p-2 h-auto md:h-80 overflow-scroll">
              <div className="flex flex-col items-center w-full md:w-1/5 bg-gray-100 md:p-4 h-full">
                <h2 className="font-bold underline md:text-xl text-gray-900">
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
              <div className="md:pr-8 w-full md:w-4/5">
                <div className="flex items-center justify-between">
                  <Button className="font-bold text-lg rounded-none bg-muted/80 text-gray-900 hover:text-white">
                    Categories
                  </Button>
                  <Link
                    href={`/products?category=${encodeURIComponent(
                      category.category_name
                    )}`}
                    passHref>
                    <Button variant="outline" className="rounded-none">
                      <span className="mr-2">See all</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center justify-start gap-4 overflow-scroll scrollbar snap-mandatory my-2">
                  {/* Render subcategories for this main category */}
                  {subcategories(category.category_id).length > 0 ? (
                    subcategories(category.category_id).map((subItem) => (
                      <Link
                        prefetch={true}
                        key={subItem.category_id}
                        href={`/products?category=${encodeURIComponent(
                          subItem.category_name
                        )}`}
                        className="group block aspect-square space-y-5 my-auto items-center h-[14rem]">
                        <Image
                          src={subItem.category_image || "/placeholder.jpg"}
                          alt={subItem.category_name}
                          width={150}
                          height={150}
                          className="w-full h-40 object-contain bg-inherit"
                        />
                        <h3 className="text-sm font-medium text-gray-900 mx-auto">
                          {subItem.category_name}
                        </h3>
                      </Link>
                    ))
                  ) : (
                    <p>No subcategories available</p>
                  )}
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
