"use client";

import { useStore } from "@/app/store";
import { useEffect, useState } from "react";
import HeroCarousels from "@/components/Client-Side/Hero/hero-carousel";

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: File;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export default function CarouselPage() {
  const fetchCarousels = useStore((state) => state.fetchCarousels);
  const carousels = useStore((state) => state.carousels);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);

  // Fetch carousels when the component mounts if not already loaded
  useEffect(() => {
    if (!carousels.length) {
      fetchCarousels();
    }
  }, [carousels, fetchCarousels]);

  return (
    <section className="container mt-4 space-y-4">
      <div className="w-full shadow-xl">
        {loading && error ? "Loading" : <HeroCarousels isAdmin />}
      </div>
    </section>
  );
}
