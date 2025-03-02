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
    <div className="mt-[10rem] lg:mt-[12rem] bg-muted/30">
      <HeroSection />
      {/* Main Content */}
      <div className="pt-2 md:container space-y-8">
        <Service />
        <DiscountedOffers />
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
          maxBanners={3}
        />
        <NewProducts />
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
          maxBanners={3}
        />
        <SubCategoryProducts categoryName="Laptops" />
        <SubCategoryProducts categoryName="Desktop Computers" />
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
          maxBanners={3}
        />
        <Categories />
        <SubCategoryProducts categoryName="SmartPhones" />
        <Banners
          contextName="Hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
          maxBanners={3}
        />
        <ShopByBrand />
        <SubCategoryProducts categoryName="Smartwatches" />
        <HomeBlogSection />
      </div>
    </div>
  );
}
