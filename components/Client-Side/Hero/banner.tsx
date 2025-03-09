"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ElectronicsBannerProps {
  /** Title of the banner with optional highlight */
  title: string;
  /** Word in the title to highlight with accent color */
  highlightWord?: string;
  /** Description text */
  description: string;
  /** Button text */
  buttonText: string;
  /** URL for the button */
  buttonUrl: string;
  /** Image source */
  imageSrc: string;
  /** Alt text for the image */
  imageAlt: string;
  /** Primary color (tailwind color class without the bg- prefix) */
  primaryColor?: string;
  /** Secondary color (tailwind color class without the bg- prefix) */
  secondaryColor?: string;
}

export default function ElectronicsBanner({
  title = "Next-Gen Tech Revolution",
  highlightWord = "Revolution",
  description = "Experience the future today with our cutting-edge electronics. Seamless integration, powerful performance, and sleek design all in one package.",
  buttonText = "Explore Collection",
  buttonUrl = "#",
  imageSrc = "/placeholder.svg?height=400&width=400",
  imageAlt = "Futuristic Electronics Device",
  primaryColor = "cyan",
  secondaryColor = "indigo",
}: ElectronicsBannerProps) {
  // Format title with highlighted word
  const formattedTitle = highlightWord
    ? title.replace(
        highlightWord,
        `<span class="text-${primaryColor}-400">${highlightWord}</span>`
      )
    : title;

  // State for animated elements
  const [isHovered, setIsHovered] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(0);

  // Demo products for auto-rotation (in a real app, these would come from props or API)
  const demoProducts = [
    {
      src: "/placeholder.svg?height=400&width=400",
      alt: "Futuristic Smartphone",
    },
    { src: "/placeholder.svg?height=400&width=400", alt: "Smart Watch" },
    { src: "/placeholder.svg?height=400&width=400", alt: "Wireless Earbuds" },
  ];

  // Auto-rotate products every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % demoProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Futuristic background with gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-slate-900 via-${secondaryColor}-900 to-slate-900`}>
        {/* Decorative elements for futuristic feel */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div
            className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-${primaryColor}-500 blur-3xl`}></div>
          <div
            className={`absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-${secondaryColor}-500 blur-3xl`}></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-violet-500 blur-3xl"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMmgxdjFoLTF2LTF6bS0yLTJoMXY0aC0xdi00em0yIDBIMzZ2NGgtNHYtNHptMi0yaDF2MWgtMXYtMXptMiAwaDF2NGgtMXYtNHptMCAyaDF2MWgtMXYtMXptMC0yaDF2MWgtMXYtMXptMiAwaDF2NGgtMXYtNHptMCAyaDF2MWgtMXYtMXptLTEwLThIMzZ2NGgtNHYtNHptMiAwaDF2NGgtMXYtNHptMCAyaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="relative flex flex-row items-center p-4 sm:p-6 lg:p-12">
        {/* Content Section */}
        <div className="text-white space-y-2 sm:space-y-4 w-1/2">
          <h2
            className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold tracking-tight"
            dangerouslySetInnerHTML={{ __html: formattedTitle }}
          />
          <p className="text-slate-200 text-xs sm:text-sm md:text-base">
            {description}
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              className={`bg-${primaryColor}-500 hover:bg-${primaryColor}-600 text-white text-xs sm:text-sm md:text-base`}
              asChild>
              <Link href={buttonUrl}>{buttonText}</Link>
            </Button>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex justify-end w-1/2">
          <div
            className="group relative w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            {/* Current product image with fade transition */}
            {demoProducts.map((product, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  currentProduct === index ? "opacity-100" : "opacity-0"
                }`}>
                <Image
                  src={product.src || "/placeholder.svg"}
                  alt={product.alt}
                  fill
                  className={`object-contain transition-all duration-500 ease-in-out ${
                    isHovered
                      ? "scale-110 rotate-3 drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]"
                      : "drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                  }`}
                />
              </div>
            ))}

            {/* Circular highlight behind product */}
            <div
              className={`absolute inset-0 rounded-full bg-${primaryColor}-500/20 blur-2xl -z-10 transition-all duration-500 ease-in-out ${
                isHovered ? `bg-${primaryColor}-500/40 blur-3xl` : ""
              }`}></div>
          </div>
        </div>
      </div>

      {/* Animated accent lines */}
      <div
        className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${primaryColor}-500 to-transparent`}></div>
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-${secondaryColor}-500 to-transparent`}></div>
    </div>
  );
}
