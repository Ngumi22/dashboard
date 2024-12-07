"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CarouselProps {
  images: string[];
  transitionDuration?: number;
  autoPlayInterval?: number;
}

export default function Carousel({
  images,
  transitionDuration = 500,
  autoPlayInterval = 5000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const intervalId = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(intervalId);
  }, [nextSlide, autoPlayInterval]);

  return (
    <div className="md:relative w-full h-full rounded-md overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            "md:absolute top-0 left-0 w-full h-full transition-opacity",
            `duration-${transitionDuration}`
          )}
          style={{
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 1 : 0,
          }}>
          <Image
            src={image}
            alt={`Carousel image ${index + 1}`}
            layout="fill"
            objectFit="cover"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className="pagination__item inline-block mx-2.5"
            onClick={() => goToSlide(index)}>
            <span
              className={cn(
                "pagination__link relative block w-[1.5rem] h-[1.5rem] indent-[-90em] overflow-hidden",
                "before:content-[''] before:block before:absolute before:top-0 before:w-full before:h-full before:rounded-full before:border-2 before:border-white before:transition-all before:duration-600 before:ease-&lsqb;cubic-bezier(0.68,-0.55,0.265,1.55)&rsqb before:bg-white before:scale-20",
                "after:content-[''] after:block after:absolute after:top-0 after:w-full after:h-full after:rounded-full after:border-2 after:border-white after:transition-all after:duration-600 after:ease-&lsqb;cubic-bezier(0.68,-0.55,0.265,1.55)&rsqb ",
                "hover:after:scale-110",
                index === currentIndex
                  ? "is-active before:scale-50 after:scale-20"
                  : "before:scale-20"
              )}>
              {index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
