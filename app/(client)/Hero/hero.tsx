"use client";

import HeroCarousels from "@/components/Client-Side/Hero/hero-carousel";
import Banners from "../main/banners";

export default function HeroSection() {
  return (
    <section className="flex md:flex-row flex-col gap-4 items-stretch md:px-2">
      {/* Hero Carousel */}
      <div className="flex-1">
        <HeroCarousels isAdmin={false} />
      </div>

      {/* Banner Component */}
      <div className="flex-1">
        <Banners
          contextName="hero"
          gridCols="grid grid-cols-1 md:grid-cols-2"
          gap="gap-3 md:gap-4"
          height="h-full md:h-full"
        />
      </div>
    </section>
  );
}
