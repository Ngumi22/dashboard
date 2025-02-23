"use client";

// Import critical components
import Service from "@/components/Client-Side/Services/service";
import HeroSection from "./Hero/hero";
import CategorySection from "@/components/Client-Side/Category/category";
import NewProducts from "./main/NewestProducts";
import Laptops from "./main/Laptops";
import Computers from "./main/Computers";
import SpecialOffers from "./main/SpecialOffers";
import ShopByCategory from "./main/Main";

export default function Page() {
  return (
    <div className="mt-[10rem] lg:mt-[12rem]">
      <HeroSection />
      {/* Main Content */}
      <div className="bg-[#F5F5F7] pt-2 md:container p-1 space-y-6">
        <Service />
        <CategorySection />
        <ShopByCategory />
        <SpecialOffers />
        <Laptops />
        <Computers />
        <NewProducts />
      </div>
    </div>
  );
}
