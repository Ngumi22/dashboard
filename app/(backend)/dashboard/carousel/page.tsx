"use client";

import { useEffect, useState } from "react";
import { CarouselForm } from "../banners/carousel";
import { getUniqueCarousel } from "@/lib/actions/Carousel/fetch";
import Image from "next/image";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [carousels, setCarousels] = useState<Carousel[]>([]);

  useEffect(() => {
    async function fetchCarousels() {
      let res = await getUniqueCarousel();
      setCarousels(res);
    }
    fetchCarousels();
  }, []);

  return (
    <section className="m-4 grid justify-items-stretch space-y-8">
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
      <div>
        {carousels.map((carousel: Carousel) => (
          <div key={carousel.carousel_id}>
            <p>{carousel.title}</p>
            <Image
              src={`data:image/jpeg;base64,${carousel.image}`}
              alt={carousel.title}
              height={200}
              width={200}
              className="object-contain transition-all duration-500 ease-in-out group-hover:scale-125 hover:ease-out h-auto w-32 my-auto"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
