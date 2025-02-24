"use client";

// Import critical components
import Service from "@/components/Client-Side/Services/service";
import HeroSection from "./Hero/hero";
import ShopByBrand from "./main/ShopByBrand";
import DiscountedOffers from "./main/Offers";
import SubCategoryProductsLaptops from "./main/Laptops";
import Categories from "./main/Categories";
import SubCategoryProductsComputers from "./main/Computers";
import NewProducts from "./main/NewestProducts";

export default function Page() {
  return (
    <div className="mt-[10rem] lg:mt-[12rem]">
      <HeroSection />
      {/* Main Content */}
      <div className="bg-[#F5F5F7] pt-2 md:container space-y-2">
        <Service />
        <DiscountedOffers />
        <SubCategoryProductsLaptops />
        {/* <SubCategoryProductsComputers /> */}
        <NewProducts />
        <Categories />
        <ShopByBrand />
      </div>
    </div>
  );
}
