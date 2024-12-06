"use client";
import HeroBanners from "./banner";

export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full my-5 p-2">
      <div className="col-span-2 w-full">
        <p>Carousel</p>
      </div>
      <div className="col-span-2 w-full">
        <HeroBanners />
      </div>
    </section>
  );
}
