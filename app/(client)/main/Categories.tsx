"use client";

import Link from "next/link";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import Base64Image from "@/components/Data-Table/base64-image";
import { getUniqueCategories } from "@/lib/actions/Category/fetch";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const url = process.env.BASE_URL1 || "https://www.bernzzdigitalsolutions.co.ke";
const MINUTE = 1000 * 60;

export default function Categories() {
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch, // Allows retrying manually
  } = useQuery({
    queryKey: ["categoryData"],
    queryFn: () => getUniqueCategories(),
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });

  // Error Handling with Retry
  if (isError) {
    return (
      <div className="text-center text-red-500">
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <ul className="flex md:grid">
        <li className="w-full flex-shrink-0 grid grid-flow-col content-center justify-between p-2 rounded-md bg-gray-200 animate-pulse">
          <div className="w-10 h-10 bg-gray-300 rounded"></div>
          <div className="w-10 h-10 bg-gray-300 rounded"></div>
          <div className="w-10 h-10 bg-gray-300 rounded"></div>
          <div className="w-10 h-10 bg-gray-300 rounded"></div>
        </li>
      </ul>
    );
  }

  return (
    <ScrollableSection
      title="Featured Categories"
      items={categories.map((category) => ({
        id: category.category_id,
        content: (
          <div
            key={category.category_id}
            className="flex-shrink-0 w-full min-w-[250px] h-32 flex items-center justify-between bg-white shadow-md p-4 rounded-md mb-2">
            <div className="flex flex-col justify-between h-1/2 space-y-2">
              <Link className="text-lg font-semibold" href={url}>
                {category.category_name}
              </Link>
              <Link
                className="text-xs text-muted-foreground font-semibold"
                href={url}>
                View All
              </Link>
            </div>
            <Base64Image
              src={
                typeof category.category_image === "string"
                  ? category.category_image
                  : "/placeholder.svg"
              }
              alt={category.category_name}
              width={100}
              height={100}
            />
          </div>
        ),
      }))}
      className="flex flex-col overflow-x-auto space-x-2 pb-4 snap-x"
    />
  );
}
