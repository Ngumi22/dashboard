"use client";
import Carousel from "@/components/Client-Side/Hero/carousel";
import { useStore } from "@/app/store";
import { useEffect } from "react";

export default function HeroCarousel() {
  const { carousels, loading, error, fetchCarousels } = useStore((state) => ({
    carousels: state.carousels,
    loading: state.loading,
    error: state.error,
    fetchCarousels: state.fetchCarousels,
  }));

  // Fetch carousels when the component mounts if not already loaded
  useEffect(() => {
    if (!carousels.length) {
      fetchCarousels();
    }
  }, [carousels, fetchCarousels]);

  if (error) return <div>Error: {error}</div>;
  return (
    <div className="col-span-2 w-full">
      <Carousel slides={carousels} />
    </div>
  );
}
