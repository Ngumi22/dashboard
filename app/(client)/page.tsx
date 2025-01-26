"use client";

import Service from "@/components/Client-Side/Services/service";
import HeroSection from "./Hero/hero";
import ProductList from "./Products/all";
import CategorySection from "@/components/Client-Side/Category/category";
import FeaturedProducts from "./Products/Featured";
import CategoryHome from "./Products/Category";

export default function Page() {
  return (
    <div className="mt-[9.4rem] mb-auto md:mt-[11rem]">
      <HeroSection />
      <div className="w-full bg-[#F5F5F7] py-4">
        <Service />
        <CategorySection />
        <CategoryHome />
        <FeaturedProducts />
        <ProductList />
      </div>
    </div>
  );
}
