"use client";

import dynamic from "next/dynamic";

// Only load Hero immediately
import HeroSection from "./Hero/hero";

// Lazy load everything else
const Service = dynamic(() => import("./main/service"), {
  ssr: false,
  loading: () => <div className="h-20 bg-gray-200 animate-pulse rounded" />,
});

const DiscountedOffers = dynamic(() => import("./main/Offers"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
});

const Banners = dynamic(() => import("./main/banners"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-200 animate-pulse rounded" />,
});

const NewProducts = dynamic(() => import("./main/NewestProducts"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
});

const SubCategoryProducts = dynamic(() => import("./main/Laptops"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
});

const Categories = dynamic(() => import("./main/Categories"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
});

const ShopByBrand = dynamic(() => import("./main/ShopByBrand"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
});

const HomeBlogSection = dynamic(() => import("./main/home-blog"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
});

export default function Page() {
  return (
    <div className="mt-[9.7rem] lg:mt-[12rem] bg-muted/80">
      <HeroSection />
      <div className="pt-2 md:container space-y-5">
        <Service />
        <DiscountedOffers />
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-2 md:gap-4"
          height="h-30 md:h-40"
          maxBanners={3}
          paddingX="px-3 md:px-8"
          paddingY="py-2 md:py-4"
        />
        <NewProducts />
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-2 md:gap-4"
          height="h-30 md:h-40"
          maxBanners={3}
          paddingX="px-3 md:px-8"
          paddingY="py-2 md:py-4"
        />
        <SubCategoryProducts categoryName="Laptops" />
        <SubCategoryProducts categoryName="Desktop Computers" />
        <Categories />
        <SubCategoryProducts categoryName="SmartPhones" />
        <ShopByBrand />
        <SubCategoryProducts categoryName="Smartwatches" />
        <HomeBlogSection />
      </div>
    </div>
  );
}
