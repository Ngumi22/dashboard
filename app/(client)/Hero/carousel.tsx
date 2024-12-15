"use client";
import { useStore } from "@/app/store";
import HeroCarousels from "@/components/Client-Side/Hero/hero-carousel";
import { useEffect } from "react";

export default function HeroCarousel() {
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
    <>
      {loading && error ? (
        <div className="p-2 md:p-3 lg:p-5 lg:basis-64 flex-grow text-center shadow-lg bg-gray-400 animate-pulse h-full"></div>
      ) : (
        <HeroCarousels />
      )}
    </>
  );
}
