"use client";

import HeroSection from "./Hero/hero";
import ProductList from "./Products/all";

export default function Page() {
  return (
    <div className="mt-[16rem] md:mt-[14rem]">
      <HeroSection />
      <ProductList />
    </div>
  );
}
