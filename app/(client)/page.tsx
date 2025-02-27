"use client";

// Import critical components
import Service from "@/components/Client-Side/Services/service";
import HeroSection from "./Hero/hero";
import ShopByBrand from "./main/ShopByBrand";
import DiscountedOffers from "./main/Offers";
import Categories from "./main/Categories";
import NewProducts from "./main/NewestProducts";
import SubCategoryProducts from "./main/Laptops";
import Bannners from "./main/banners";

export default function Page() {
  return (
    <div className="mt-[10rem] lg:mt-[12rem]">
      <HeroSection />
      {/* Main Content */}
      <div className="bg-[#F5F5F7] pt-2 md:container space-y-8">
        <Service />
        <DiscountedOffers />
        <Bannners
          contextName="Hero"
          gridCols="grid grid-cols-1 md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
        />
        <NewProducts />
        <Bannners
          contextName="Hero"
          gridCols="grid grid-cols-1 md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
        />
        <SubCategoryProducts categoryName="Laptops" />
        <SubCategoryProducts categoryName="Desktop Computers" />
        <Bannners
          contextName="Hero"
          gridCols="grid grid-cols-1 md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
        />
        <Categories />
        <SubCategoryProducts categoryName="SmartPhones" />
        <Bannners
          contextName="Hero"
          gridCols="grid grid-cols-1 md:grid-cols-3"
          gap="gap-4 md:gap-6"
          height="h-40 md:h-44"
        />
        <ShopByBrand />
        <SubCategoryProducts categoryName="Smartwatches" />
      </div>
    </div>
  );
}
