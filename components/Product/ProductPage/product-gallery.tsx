"use client";

import type * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useMemo, useState, useEffect } from "react";

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
  const [currentImage, setCurrentImage] = useState(mainImage);
  const [isZoomed, setIsZoomed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const allImages = useMemo(() => {
    return [mainImage, ...thumbnails.flatMap((t) => Object.values(t))];
  }, [mainImage, thumbnails]);

  const currentIndex = allImages.indexOf(currentImage);

  const changeImage = (newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentImage(allImages[newIndex]);
      setIsAnimating(false);
    }, 300); // Matches CSS transition time
  };

  const nextImage = () => changeImage((currentIndex + 1) % allImages.length);
  const previousImage = () =>
    changeImage((currentIndex - 1 + allImages.length) % allImages.length);

  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const image = e.currentTarget;
    const { left, top, width, height } = image.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div className="space-y-5">
      {/* Main Image */}
      <div
        className={cn(
          "relative aspect-square overflow-hidden w-96 group rounded-lg h-80 bg-gray-200 p-4",
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
        onClick={() => setDialogOpen(true)}
        onMouseMove={handleZoom}>
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out">
          <Image
            src={currentImage}
            alt="Product image"
            fill
            className={cn(
              "object-contain transition-transform duration-500 h-auto w-auto bg-inherit",
              isZoomed && "scale-150",
              isAnimating ? "opacity-0 scale-105" : "opacity-100 scale-100"
            )}
          />
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            previousImage();
          }}>
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous image</span>
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
          <span className="sr-only">Next image</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}>
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom image</span>
        </Button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-6 gap-2 w-96">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => changeImage(index)}
            className={cn(
              "relative object-contain overflow-hidden rounded-md bg-muted w-full transition-transform duration-200 ease-in-out",
              currentImage === image
                ? "ring-2 ring-primary scale-105"
                : "hover:scale-105"
            )}>
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              height={60}
              width={60}
              className="object-contain h-auto w-auto"
            />
          </button>
        ))}
      </div>

      {/* Dialog for fullscreen view */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 border-none bg-transparent">
          <div className="relative h-full w-full flex items-center justify-center group">
            <DialogClose className="absolute right-4 top-4 z-10 bg-white hover:bg-white/40 rounded-full p-2">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out">
                <Image
                  src={allImages[dialogIndex]}
                  alt={`Dialog image ${dialogIndex + 1}`}
                  fill
                  className="object-contain transition-transform duration-500"
                />
              </div>
            </div>

            {/* Dialog Navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-white/40 rounded-full"
              onClick={() =>
                setDialogIndex(
                  (prev) => (prev - 1 + allImages.length) % allImages.length
                )
              }>
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous image</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 rounded-full"
              onClick={() =>
                setDialogIndex((prev) => (prev + 1) % allImages.length)
              }>
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
