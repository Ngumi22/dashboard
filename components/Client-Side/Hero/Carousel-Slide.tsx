"use client";
import Image from "next/image";
import Link from "next/link";

type MiniCarousel = {
  carousel_id: number;
  title: string;
  short_description: string;
  description: string;
  image: string;
  link: string;
};

export default function CarouselSlide({
  carousel,
  isActive,
  isAnimating,
}: {
  carousel: MiniCarousel;
  isActive: boolean;
  isAnimating: boolean;
}) {
  return (
    <div className="relative aspect-[16/9] bg-gradient-to-tr from-gray-900 to-gray-800 md:rounded overflow-hidden shadow-2xl w-full h-full lg:py-8">
      {/* Carousel image positioned behind text */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full flex items-center justify-center z-0">
        <div
          className={`${
            isActive && isAnimating ? "animate-slide-in-bottom" : ""
          }`}>
          <Image
            src={carousel.image}
            alt={`${carousel.title} ${carousel.short_description}`}
            width={500}
            height={500}
            className="object-contain scale-50 md:scale-75 h-auto w-auto"
          />
        </div>
      </div>

      {/* Content container */}
      <div className="relative h-full p-4 lg:p-12 z-10">
        {/* Left side text content */}
        <div className="flex flex-col justify-center w-full md:w-1/2 h-full">
          <div
            className={`${
              isActive && isAnimating ? "animate-slide-in-top" : ""
            }`}>
            <h2 className="text-sky-300 text-md md:text-2xl font-medium mb-1">
              {carousel.title}
            </h2>
            <h1 className="text-white text-md md:text-2xl lg:text-5xl font-bold mb-4 tracking-tight">
              {carousel.short_description}
              <span className="border-b-4 border-white pb-1 pr-10"></span>
            </h1>
            <p className="text-gray-300 text-xs md:text-base max-w-md mb-4 md:mb-8">
              {carousel.description}
            </p>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <Link
                href={carousel.link}
                className="text-xs md:text-base bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 md:px-8 md:py-2 rounded-md transition-colors">
                Buy Now
              </Link>
            </div>
          </div>
        </div>

        {/* Vertical BDS text */}
        <div className="absolute right-0 bottom-0 bg-red-600 text-white py-4 px-1 md:py-6 md:px-2 flex items-center z-20">
          <span className="transform rotate-90 origin-center font-bold tracking-wider text-xs whitespace-nowrap">
            BDS
          </span>
        </div>
      </div>
    </div>
  );
}
