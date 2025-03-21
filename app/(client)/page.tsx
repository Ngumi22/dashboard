"use client";

// Import critical components
import Service from "@/components/Client-Side/Services/service";
import HeroSection from "./Hero/hero";
import ShopByBrand from "./main/ShopByBrand";
import DiscountedOffers from "./main/Offers";
import Categories from "./main/Categories";
import NewProducts from "./main/NewestProducts";
import SubCategoryProducts from "./main/Laptops";
import Banners from "./main/banners";
import HomeBlogSection from "./main/home-blog";

export default function Page() {
  return (
    <div className="mt-[9.7rem] lg:mt-[12rem] bg-muted/80">
      <HeroSection />
      {/* Main Content */}
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
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-2 md:gap-4"
          height="h-30 md:h-40"
          maxBanners={3}
          paddingX="px-3 md:px-8"
          paddingY="py-2 md:py-4"
        />
        <Categories />
        <SubCategoryProducts categoryName="SmartPhones" />
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-2 md:gap-4"
          height="h-30 md:h-40"
          maxBanners={3}
          paddingX="px-3 md:px-8"
          paddingY="py-2 md:py-4"
        />
        <ShopByBrand />
        <SubCategoryProducts categoryName="Smartwatches" />
        <HomeBlogSection />
      </div>
    </div>
  );
}
