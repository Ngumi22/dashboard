"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// // Lazy load non-critical components
// const ProductList = dynamic(() => import("./Products/all"), {
//   ssr: false,
//   loading: () => <ProductListSkeleton />,
// });
const FeaturedCollection = dynamic(() => import("./main/FeaturedCollection"), {
  ssr: false,
  loading: () => <FeaturedCollectionSkeleton />,
});

// Import critical components
import Service from "@/components/Client-Side/Services/service";
import HeroSection from "./Hero/hero";
import CategorySection from "@/components/Client-Side/Category/category";
import Banners1 from "./main/Banners1";
// import CategoryHome from "./Products/Category";

// Skeleton Loaders
function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-64 w-full" />
      ))}
    </div>
  );
}

function FeaturedCollectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-64 w-full" />
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <div className="mt-[9.5rem] lg:mt-[11.5rem]">
      <HeroSection />

      {/* Main Content */}
      <div className="bg-[#F5F5F7] pt-2 md:container p-1">
        <Service />
        <CategorySection />
        <FeaturedCollection />
        {/* <Banners1 /> */}
        {/* <CategoryHome />
        <FeaturedProducts /> */}
      </div>
    </div>
  );
}
