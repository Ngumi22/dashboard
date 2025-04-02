"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load both carousel and banners
const Carousel = dynamic(
  () => import("@/components/Client-Side/Hero/Carousel"),
  {
    ssr: false,
    loading: () => (
      <div className="h-52 md:h-96 bg-gray-200 animate-pulse w-full" />
    ),
  }
);

const Banners = dynamic(() => import("../main/banners"), {
  ssr: false,
  loading: () => (
    <div className="flex gap-2 w-full">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-40 w-full bg-gray-200 animate-pulse rounded"
        />
      ))}
    </div>
  ),
});

export default function HeroSection() {
  return (
    <section className="md:flex gap-2 px-0 md:px-2 my-2">
      <Suspense
        fallback={
          <div className="h-52 md:h-96 bg-gray-200 animate-pulse w-full" />
        }>
        <Carousel />
      </Suspense>
      <Suspense
        fallback={
          <div className="flex gap-2 w-full">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 w-full bg-gray-200 animate-pulse rounded"
              />
            ))}
          </div>
        }>
        <Banners
          contextName="hero"
          gridCols="flex md:grid grid-cols-1 overflow-scroll scrollbar md:grid-cols-2 md:max-w-xl w-full mt-1 md:mt-0"
          gap="gap-2"
          height="h-full md:h-auto"
          maxBanners={4}
        />
      </Suspense>
    </section>
  );
}
