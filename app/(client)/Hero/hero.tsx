"use client";
import HeroBanners from "./banner";

export default function HeroSection() {
  return (
    <section className="grid grid-cols-4 gap-4 w-full my-2">
      <div className="col-span-2">
        <p>Carousel</p>
      </div>
      <div className="col-span-2">
        <HeroBanners />
      </div>
    </section>
  );
}
