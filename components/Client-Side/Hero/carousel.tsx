"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  transitionDuration?: number;
  autoPlayInterval?: number;
}

export default function Carousel({
  slides,
  transitionDuration = 500,
  autoPlayInterval = 5000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const intervalId = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(intervalId);
  }, [nextSlide, autoPlayInterval]);

  return (
    <div className="relative w-full h-[465px] rounded-md overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute top-0 left-0 w-full h-full transition-opacity",
            `duration-${transitionDuration}`
          )}
          style={{
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 1 : 0,
          }}>
          {slide.image && (
            <Image
              src={`data:image/jpeg;base64,${slide.image}`}
              alt={slide.title}
              layout="fill"
              objectFit="contain"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
            />
          )}
          <div
            className="absolute inset-0 flex flex-col justify-end p-8"
            style={{ backgroundColor: `${slide.background_color}80` }}>
            <h2
              className="text-4xl font-bold mb-2"
              style={{ color: slide.text_color }}>
              {slide.title}
            </h2>
            {slide.short_description && (
              <p className="text-xl mb-4" style={{ color: slide.text_color }}>
                {slide.short_description}
              </p>
            )}
            {slide.description && (
              <p className="text-lg mb-6" style={{ color: slide.text_color }}>
                {slide.description}
              </p>
            )}
            {slide.link && (
              <Link href={slide.link}>
                <Button variant="outline" className="w-fit">
                  Learn More
                </Button>
              </Link>
            )}
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className="pagination__item inline-block mx-2.5"
            onClick={() => goToSlide(index)}>
            <span
              className={cn(
                "pagination__link relative block w-[1.5rem] h-[1.5rem] indent-[-90em] overflow-hidden",
                "before:content-[''] before:block before:absolute before:top-0 before:w-full before:h-full before:rounded-full before:border-2 before:border-white before:transition-all before:duration-600 before:ease-&lsqb;cubic-bezier(0.68,-0.55,0.265,1.55)&rsqb before:bg-white before:scale-20",
                "after:content-[''] after:block after:absolute after:top-0 after:w-full after:h-full after:rounded-full after:border-2 after:border-white after:transition-all after:duration-600 after:ease-&lsqb;cubic-bezier(0.68,-0.55,0.265,1.55)&rsqb",
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
