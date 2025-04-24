"use client";
import Link from "next/link";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import Base64Image from "@/components/Data-Table/base64-image";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";
import { useQuery } from "@tanstack/react-query";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const result = await fetchProducts({
          metadataOnly: true,
        });

        const rawCategories = result?.filters?.categories || [];
        const categories: Category[] = rawCategories.filter((c: any) => {
          const isTopLevel = c.parent_category_id == null && c.parentId == null; // covers null & undefined

          return isTopLevel;
        });

        if (!categories.length) {
          return [];
        }

        return categories;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  // Loading state with skeleton loader
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold px-4">Featured Categories</h2>
        <div className="flex overflow-x-auto pb-4 gap-4 px-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex-shrink-0 w-[250px] h-32 bg-gray-100 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!categories.length) {
    return null;
  }

  return (
    <ScrollableSection
      title="Featured Categories"
      items={categories.map((category) => ({
        id: category.id,
        key: category.id,
        content: (
          <div
            key={category.id}
            className="flex-shrink-0 w-[250px] h-40 flex items-center justify-between bg-white shadow-md p-2 rounded-md">
            <div className="flex flex-col justify-around h-32">
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="text-md font-semibold hover:text-blue-600 transition-colors">
                {category.name}
              </Link>
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="text-md font-semibold hover:underline underline-offset-4">
                Shop Now <span>→</span>
              </Link>
            </div>
            {category.image && (
              <Base64Image
                src={category.image}
                alt={category.name}
                width={120}
                height={120}
              />
            )}
          </div>
        ),
      }))}
      className="flex flex-col overflow-x-auto space-x-2 pb-4 snap-x"
    />
  );
}
