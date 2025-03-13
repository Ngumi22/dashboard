"use client";

import type * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Convert thumbnails array to a flat array of images
  const allImages = useMemo(() => {
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
    setDirection(1);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setCurrentImage(allImages[nextIndex]);
  };

  const previousImage = () => {
    setDirection(-1);
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

  const openDialog = (index: number) => {
    setDialogIndex(index);
    setDialogOpen(true);
  };

  const nextDialogImage = () => {
    setDirection(1);
    setDialogIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const prevDialogImage = () => {
    setDirection(-1);
    setDialogIndex(
      (prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length
    );
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  // Thumbnail animation variants
  const thumbnailVariants = {
    inactive: { opacity: 0.6, scale: 0.95 },
    active: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex gap-4 w-full">
      {/* Thumbnails */}
      <div className="grid grid-cols-1 gap-2 w-16 h-96 ">
        {allImages.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentImage(image);
            }}
            initial="inactive"
            animate={currentImage === image ? "active" : "inactive"}
            whileHover="hover"
            variants={thumbnailVariants}
            className={cn(
              "relative object-contain overflow-hidden rounded-md bg-muted w-full",
              currentImage === image && "ring-2 ring-primary"
            )}>
            <Image
              src={`data:image/jpeg;base64,${image}`}
              alt={`Product thumbnail ${index + 1}`}
              height={60}
              width={60}
              className="object-contain h-14 w-auto"
            />
          </motion.button>
        ))}
      </div>

      {/* Main Image */}
      <div
        className={cn(
          "relative aspect-square overflow-hidden w-full group h-96 bg-gray-200 p-2",
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
        onClick={() => openDialog(currentIndex)}
        onMouseMove={handleZoom}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentImage}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0">
            <Image
              src={`data:image/jpeg;base64,${currentImage}`}
              alt="Product image"
              fill
              className={cn(
                "object-contain transition-transform duration-500 h-auto w-auto bg-inherit",
                isZoomed && "scale-150"
              )}
            />
          </motion.div>
        </AnimatePresence>

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

      {/* Dialog for fullscreen gallery */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 border-none bg-transparent">
          <div className="relative h-full w-full flex items-center justify-center group">
            <DialogClose className="absolute right-4 top-4 z-10 bg-white hover:bg-white/40 rounded-full p-2">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={dialogIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={`data:image/jpeg;base64,${allImages[dialogIndex]}`}
                    alt={`Product image ${dialogIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-white/40 rounded-full"
              onClick={prevDialogImage}>
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous image</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 rounded-full"
              onClick={nextDialogImage}>
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
