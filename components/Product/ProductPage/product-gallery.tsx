"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  mainImage: string;
  thumbnails: {
    thumbnail1: string;
    thumbnail2: string;
    thumbnail3: string;
    thumbnail4: string;
    thumbnail5: string;
  }[];
}

export default function ProductGallery({
  mainImage,
  thumbnails,
}: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = React.useState(mainImage);
  const [isZoomed, setIsZoomed] = React.useState(false);

  // Convert thumbnails array to a flat array of images
  const allImages = React.useMemo(() => {
    const images = [mainImage];
    thumbnails.forEach((thumbnail) => {
      Object.values(thumbnail).forEach((url) => {
        if (url) images.push(url);
      });
    });
    return images;
  }, [mainImage, thumbnails]);

  const currentIndex = allImages.indexOf(currentImage);

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % allImages.length;
    setCurrentImage(allImages[nextIndex]);
  };

  const previousImage = () => {
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentImage(allImages[prevIndex]);
  };

  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const image = e.currentTarget;
    const { left, top, width, height } = image.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div className="relative group">
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-lg bg-muted",
          isZoomed && "cursor-zoom-out",
          !isZoomed && "cursor-zoom-in"
        )}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleZoom}>
        <Image
          src={`data:image/jpeg;base64,${currentImage}`}
          alt="Product image"
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isZoomed && "scale-150"
          )}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            previousImage();
          }}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}>
          <ChevronRight className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-4">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(image)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-md bg-muted",
              currentImage === image && "ring-2 ring-primary"
            )}>
            <Image
              src={`data:image/jpeg;base64,${image}`}
              alt={`Product thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
