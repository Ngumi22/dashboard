"use client";

import Banners from "../main/banners";
import Carousel from "@/components/Client-Side/Hero/Carousel";

export default function HeroSection() {
  return (
    <section className="flex md:flex-row flex-col gap-4 items-stretch md:px-2">
      {/* Hero Carousel */}
      <div className="w-full max-w-3xl">
        <Carousel />
      </div>

      {/* Banner Component */}
      <div className="flex-1">
        <Banners
          contextName="hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-2"
          gap="gap-1 md:gap-2"
          height="h-full md:h-full"
          maxBanners={4}
        />
      </div>
    </section>
  );
}
