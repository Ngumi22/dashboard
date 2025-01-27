"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import { useStore } from "@/app/store";
import Base64Image from "@/components/Data-Table/base64-image";
import { useEffect } from "react";

const url = process.env.BASE_URL1 || "https://www.bernzzdigitalsolutions.co.ke";

export default function FeaturedProducts() {
  const categories = useStore((state) => state.categories);
  const fetchCategories = useStore((state) => state.fetchUniqueCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, categories]);

  return (
    <section className="md:container p-2">
      <ScrollableSection
        title="Shop By Categories"
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
                    : ""
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
    </section>
  );
}
