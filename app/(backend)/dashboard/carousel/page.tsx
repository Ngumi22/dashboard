"use client";

import HeroCarousels from "@/components/Client-Side/Hero/hero-carousel";

export default function CarouselPage() {
  return (
    <section className="container mt-4 space-y-4">
      <div className="w-full shadow-xl">
        <HeroCarousels isAdmin />
      </div>
    </section>
  );
}
