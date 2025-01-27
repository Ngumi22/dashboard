"use client";

import HeroCarousels from "@/components/Client-Side/Hero/hero-carousel";
import BannerComponent from "@/components/Client-Side/Hero/banners";

export default function HeroSection() {
  return (
    <section className="flex md:flex-row flex-col gap-4 items-stretch px-4">
      {/* Hero Carousel */}
      <div className="flex-1">
        <HeroCarousels isAdmin={false} />
      </div>

      {/* Banner Component */}
      <div className="flex-1">
        <BannerComponent isAdmin={false} usageContext="Hero" />
      </div>
    </section>
  );
}
