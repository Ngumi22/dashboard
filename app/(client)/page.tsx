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
        <Bannners contextName="Hero" />
        <NewProducts />
        <Bannners contextName="Hero" />
        <SubCategoryProducts categoryName="Laptops" />
        <SubCategoryProducts categoryName="Desktop Computers" />
        <Bannners contextName="Hero" />
        <Categories />
        <SubCategoryProducts categoryName="SmartPhones" />
        <Bannners contextName="Hero" />
        <ShopByBrand />
        <SubCategoryProducts categoryName="Smartwatches" />
      </div>
    </div>
  );
}
