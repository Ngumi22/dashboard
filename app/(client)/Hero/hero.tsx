"use client";

import Banners from "../main/banners";
import Carousel from "@/components/Client-Side/Hero/Carousel";

export default function HeroSection() {
  return (
    <section className="md:flex gap-2 space-y-2 md:space-y-0 px-0 md:px-2 my-2">
      {/* Hero Carousel */}
      <Carousel />
      {/* Banner Component */}
      <Banners
        contextName="hero"
        gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-2 md:max-w-xl w-full"
        gap="gap-2"
        height="h-full md:h-auto"
        maxBanners={4}
      />
    </section>
  );
}
