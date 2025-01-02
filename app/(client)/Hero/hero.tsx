"use client";

import HeroCarousels from "@/components/Client-Side/Hero/hero-carousel";
import BannerComponent from "@/components/Client-Side/Hero/banners";

export default function HeroSection() {
  return (
    <section className="mx-1 grid grid-cols-1 lg:grid-cols-4 gap-4 w-min-screen my-5 h-full">
      <div className="col-span-2 flex flex-col h-full">
        <HeroCarousels isAdmin={false} />
      </div>
      <div className="col-span-2 flex flex-col h-full">
        <BannerComponent isAdmin={false} />
      </div>
    </section>
  );
}
