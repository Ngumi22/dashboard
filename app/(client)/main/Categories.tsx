"use client";
import Link from "next/link";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import Base64Image from "@/components/Data-Table/base64-image";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";
import { useQuery } from "@tanstack/react-query";

const BASE_URL =
  process.env.BASE_URL1 || "https://www.bernzzdigitalsolutions.co.ke";

type Category = {
  id: string;
  name: string;
  image: string | null;
};

export default function Categories() {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const result = await fetchProducts({
          metadataOnly: true,
        });

        const rawCategories = result?.filters?.categories || [];

        const categories: Category[] = rawCategories
          .filter(
            (c: any) =>
              (c.category_status === "active" || c.status === "active") &&
              !c.parent_category_id &&
              !c.parentId
          )
          .map((c: any) => ({
            id: c.category_id.toString(),
            name: c.category_name,
            image: c.category_image || c.image,
          }));

        if (!categories.length) {
          console.warn("No active main categories received from API");
          return [];
        }

        return categories;
      } catch (error) {
        console.error("Fetch error:", error);
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
    return (
      <div className="space-y-4 px-4">
        <h2 className="text-lg font-semibold">Featured Categories</h2>
        <div className="text-center py-8 text-gray-500">
          No categories available
        </div>
      </div>
    );
  }

  return (
    <ScrollableSection
      title="Featured Categories"
      items={categories.map((category) => ({
        id: category.id,
        content: (
          <div
            key={category.id}
            className="flex-shrink-0 w-[250px] h-32 flex items-center justify-between bg-white shadow-md p-4 rounded-md">
            <div className="flex flex-col justify-between h-full">
              <Link
                href={`${BASE_URL}/categories/${category.id}`}
                className="text-lg font-semibold hover:text-blue-600 transition-colors">
                {category.name}
              </Link>
              <Link
                href={`${BASE_URL}/categories/${category.id}`}
                className="text-sm text-gray-500 hover:text-blue-500 transition-colors">
                Shop Now →
              </Link>
            </div>
            {category.image && (
              <div className="w-20 h-20 relative">
                <Base64Image
                  src={category.image}
                  alt={category.name}
                  width={80}
                  height={80}
                />
              </div>
            )}
          </div>
        ),
      }))}
      className="flex flex-col overflow-x-auto space-x-2 pb-4 snap-x"
    />
  );
}
