"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BannerProps } from "@/lib/definitions";

const BannerCarousel: React.FC<BannerProps> = ({
  images,
  interval = 5000,
  height = 320,
  width = "100%",
  className = "",
  imageClassName = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ height, width }}>
      {images.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}>
          {image.link ? (
            <Link href={image.link} passHref>
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                layout="fill"
                objectFit="cover"
                className={`cursor-pointer h-auto w-auto ${imageClassName}`}
              />
            </Link>
          ) : (
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
              className={`${imageClassName} h-auto w-auto`}
            />
          )}
          <div>
            <h1 className="text-white text-xl font-semibold absolute top-0 bottom-0 left-0 right-0 text-center align-middle">
              Banner
            </h1>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerCarousel;
