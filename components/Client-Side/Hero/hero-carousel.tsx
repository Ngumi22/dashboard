"use client";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Image from "next/image";
import { Button } from "@react-email/components";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CarouselSlide {
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

interface CarouselProps {
  slides: CarouselSlide[];
}

export default function HeroCarousels({ slides }: CarouselProps) {
  return (
    <div className="">
      <Carousel
        className="max-w-full"
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
        opts={{
          loop: true,
        }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.carousel_id} className="relative">
              <div className="p-1">
                <Card className="h-full">
                  <CardContent className="grid grid-cols-5">
                    <div className="col-span-3 grid grid-flow-row space-y-6">
                      <h2
                        className="text-4xl font-semibold"
                        style={{ color: slide.text_color }}>
                        {slide.title}
                      </h2>
                      <p
                        className="text-3xl font-semibold"
                        style={{ color: slide.text_color }}>
                        {slide.short_description}
                      </p>

                      <p
                        className="text-lg"
                        style={{ color: slide.text_color }}>
                        {slide.description}
                      </p>

                      <Button>
                        <Link href={String(slide.link)}>SHOP NOW</Link>
                      </Button>
                    </div>
                    <div className="col-span-2">
                      {slide.image && (
                        <Image
                          src={`data:image/jpeg;base64,${slide.image}`}
                          alt={slide.title}
                          height={200}
                          width={200}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <CarouselPrevious className="absolute top-1/2" />
              <CarouselNext className="absolute top-1/2" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
