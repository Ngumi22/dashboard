"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import {
  ArrowRight,
  CalendarHeart,
  ReplaceAll,
  Sparkle,
  Truck,
} from "lucide-react";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchCategoryWithSubCat } from "@/lib/actions/Category/fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";

export interface Category {
  category_id: number;
  category_name: string;
  category_image: string | null;
  category_description: string;
  category_status: "active" | "inactive";
  parent_category_id?: number | null;
  category_slug?: string;
}
interface MegaMenuProps {
  initialData?: Category[]; // Server-prefetched data
}

const MINUTE = 1000 * 60;

export default function MegaMenu({ initialData }: MegaMenuProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const debouncedActiveMenu = useDebounce(activeMenu, 100);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: categoriesData = initialData, // Fallback to server data
    isLoading,
    isError,
  } = useQuery<Category[], Error>({
    queryKey: ["categoryDataWithSub"],
    queryFn: () => fetchCategoryWithSubCat(),
    initialData,
    staleTime: 24 * 60 * MINUTE,
    gcTime: 48 * 60 * MINUTE,
    placeholderData: keepPreviousData,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Loading state (only shows if no initialData)
  if ((isLoading && !initialData) || !categoriesData) {
    return <Skeleton className="h-12 w-full rounded-lg" />;
  }
  if (isError || !categoriesData) return <div>Error fetching categories</div>;

  const categoriesWithSlugs = categoriesData.map((category) => ({
    ...category,
    category_slug: generateSlug(category.category_name),
  }));

  const mainCategories = categoriesWithSlugs.filter(
    (category) => category.parent_category_id === null
  );

  const subcategories = (parentCategoryId: number) =>
    categoriesWithSlugs.filter(
      (category) => category.parent_category_id === parentCategoryId
    );

  const handleMenuInteraction = (categoryId: number | null) => {
    setActiveMenu(categoryId);
  };

  return (
    <div className="relative w-full">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() =>
            handleMenuInteraction(
              activeMenu ? null : mainCategories[0]?.category_id
            )
          }
          className="flex items-center justify-between w-full px-4 py-3 bg-white border rounded-lg shadow-sm">
          <span className="font-medium">Shop Categories</span>
          <svg
            className={`w-5 h-5 transition-transform ${
              activeMenu ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Desktop/Mobile Menu */}
      <div
        className={cn(
          "w-full transition-all duration-300 ease-in-out",
          isMobile
            ? `fixed inset-0 z-50 bg-white transform ${
                activeMenu ? "translate-y-0" : "-translate-y-full"
              } pt-4 overflow-y-auto`
            : "relative"
        )}>
        {isMobile && (
          <div className="flex justify-between items-center px-4 mb-4">
            <h2 className="text-xl font-bold">Categories</h2>
            <button
              onClick={() => handleMenuInteraction(null)}
              className="p-2 rounded-full hover:bg-gray-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <NavigationMenu className="w-full">
          <NavigationMenuList
            className={cn(
              "flex gap-1 justify-center",
              isMobile ? "flex-col px-4" : "flex-wrap"
            )}>
            {mainCategories.map((category) => (
              <NavigationMenuItem
                key={category.category_id}
                onMouseEnter={
                  !isMobile
                    ? () => handleMenuInteraction(category.category_id)
                    : undefined
                }
                onClick={
                  isMobile
                    ? () => handleMenuInteraction(category.category_id)
                    : undefined
                }
                className={cn(
                  "relative",
                  isMobile && "border-b border-gray-100"
                )}>
                <NavigationMenuTrigger
                  className={cn(
                    "h-12 px-4 text-base font-medium text-gray-800 hover:bg-gray-50 transition-colors duration-200",
                    isMobile ? "w-full justify-between" : "",
                    debouncedActiveMenu === category.category_id && !isMobile
                      ? "bg-gray-50 text-primary"
                      : ""
                  )}>
                  {category.category_name}
                  {isMobile && (
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        activeMenu === category.category_id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </NavigationMenuTrigger>

                {(debouncedActiveMenu === category.category_id || isMobile) && (
                  <NavigationMenuContent
                    className={cn(
                      "absolute left-0 bg-white shadow-xl rounded-b-lg p-4",
                      isMobile
                        ? "w-full relative shadow-none border-t border-gray-100"
                        : "w-screen animate-fade-in"
                    )}>
                    <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row">
                      <div
                        className={cn(
                          "flex-col items-start p-4 bg-gray-50 rounded-lg",
                          isMobile
                            ? "w-full mb-4"
                            : "hidden md:flex w-1/4 shrink-0"
                        )}>
                        <h2 className="font-semibold text-lg text-gray-900 mb-3">
                          Good to know
                        </h2>
                        <ul className="space-y-3 text-sm">
                          <li className="flex gap-2 items-center text-gray-700 hover:text-primary transition-colors">
                            <ReplaceAll className="w-4 h-4" /> We accept returns
                          </li>
                          <li className="flex gap-2 items-center text-gray-700 hover:text-primary transition-colors">
                            <Truck className="w-4 h-4" /> Payment on delivery
                          </li>
                          <li className="flex gap-2 items-center text-gray-700 hover:text-primary transition-colors">
                            <Sparkle className="w-4 h-4" /> Exclusive Deals
                          </li>
                          <li className="flex gap-2 items-center text-gray-700 hover:text-primary transition-colors">
                            <CalendarHeart className="w-4 h-4" /> 12 months
                            Warranty
                          </li>
                        </ul>
                      </div>

                      <div className="flex-1 md:pl-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg">Categories</h3>
                          <Link
                            href={`/products?category=${encodeURIComponent(
                              category.category_name
                            )}`}
                            legacyBehavior>
                            <Button
                              variant="outline"
                              className="rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors">
                              See all <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>

                        <div className="relative">
                          <div className="flex space-x-4 pb-2 overflow-x-auto scrollbar-hide">
                            {subcategories(category.category_id).length > 0 ? (
                              subcategories(category.category_id).map(
                                (subItem) => (
                                  <Link
                                    key={subItem.category_id}
                                    href={`/products?category=${encodeURIComponent(
                                      subItem.category_name
                                    )}`}
                                    className="group flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 min-w-[120px]">
                                    <div className="relative w-24 h-24 mb-2 overflow-hidden rounded-lg bg-gray-100">
                                      <Image
                                        src={
                                          subItem.category_image ||
                                          "/placeholder.jpg"
                                        }
                                        alt={subItem.category_name}
                                        width={150}
                                        height={150}
                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                      />
                                    </div>
                                    <h3 className="text-sm font-medium text-center text-gray-800 group-hover:text-primary">
                                      {subItem.category_name}
                                    </h3>
                                  </Link>
                                )
                              )
                            ) : (
                              <p className="text-gray-500 text-sm">
                                No subcategories available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobile && activeMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => handleMenuInteraction(null)}
        />
      )}
    </div>
  );
}
