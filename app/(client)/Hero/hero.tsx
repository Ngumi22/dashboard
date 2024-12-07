"use client";
import Carousel from "@/components/Client-Side/Hero/carousel";
import HeroBanners from "./banner";

export default function HeroSection() {
  const images = [
    "/bg.jpg",
    "/placeholder.svg",
    "/bg.jpg",
    "/placeholder.svg",
    "/bg.jpg",
    "/placeholder.svg",
    "/bg.jpg",
    "/placeholder.svg",
  ];
  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full my-5 p-2">
      <div className="col-span-2 w-full">
        <Carousel images={images} />p
      </div>
      <div className="col-span-2 w-full">
        <HeroBanners />
      </div>
    </section>
  );
}
