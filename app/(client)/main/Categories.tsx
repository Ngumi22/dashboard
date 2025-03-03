"use client";

import Link from "next/link";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import Base64Image from "@/components/Data-Table/base64-image";
import { useCategoriesQuery } from "@/lib/actions/Hooks/useCategory";

const url = process.env.BASE_URL1 || "https://www.bernzzdigitalsolutions.co.ke";

export default function Categories() {
  const { data: categories = [] } = useCategoriesQuery();

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
