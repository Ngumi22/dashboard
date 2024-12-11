"use client";

import { CarouselForm } from "../banners/carousel";

import Carousel from "@/components/Client-Side/Hero/carousel";
import { useStore } from "@/app/store";
import { useEffect } from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    <section className="relative m-4 grid justify-items-stretch space-y-8 h-screen">
      <div className="justify-self-end">
        <Sheet>
          <SheetTrigger className="border border-black p-2 rounded-md">
            Create Carousel
          </SheetTrigger>
          <SheetContent className="overflow-scroll">
            <CarouselForm />
          </SheetContent>
        </Sheet>
      </div>
      <div className="w-full">
        {loading ? "Loading" : <HeroCarousels slides={carousels} />}
      </div>
    </section>
  );
}
