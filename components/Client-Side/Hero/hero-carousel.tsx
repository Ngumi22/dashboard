"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import router from "next/router";
import dynamic from "next/dynamic";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { CarouselForm } from "@/app/(backend)/dashboard/carousel/carousel";
import {
  HeroCarouselsProps,
  CarouselItemm,
} from "@/lib/actions/Carousel/carouselType";

export default function HeroCarousels({ isAdmin = false }: HeroCarouselsProps) {
  const { toast } = useToast();
  const fetchCarousels = useStore((state) => state.fetchCarousels);
  const carousels = useStore((state) => state.carousels);
  const error = useStore((state) => state.error);
  const removeCarousel = useStore((state) => state.deleteCarouselState);

  const [editingCarousel, setEditingCarousel] = useState<CarouselItemm | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!carousels || carousels.length === 0) {
      fetchCarousels();
    }
  }, [carousels, fetchCarousels]);

  const handleDelete = useCallback(
    async (carousel_id: number) => {
      try {
        removeCarousel(carousel_id);
        toast({
          variant: "destructive",
          title: "Delete Carousel",
          description: `Carousel with ID ${carousel_id} deleted successfully.`,
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
        router.push("http://localhost:3000/dashboard/carousel");
      } catch {
        toast({
          variant: "destructive",
          title: "Delete Carousel",
          description: `Failed to delete carousel with ID ${carousel_id}.`,
          action: <ToastAction altText="Undo">Undo</ToastAction>,
        });
      }
    },
    [removeCarousel, toast]
  );

  // Filtered carousel data
  const filteredCarousel = useMemo(() => {
    if (isAdmin) {
      return carousels || [];
    }
    return (carousels || [])
      .filter((carousel) => carousel.status === "active")
      .slice(0, 4);
  }, [carousels, isAdmin]);

  // Memoize carousel autoplay plugin
  const autoplayPlugin = useMemo(
    () =>
      !isAdmin
        ? [
            Autoplay({
              delay: 4000,
            }),
          ]
        : [],
    [isAdmin]
  );

  return (
    <div className="grid">
      {isAdmin && (
        <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SheetTrigger className="border border-black p-2 rounded-md justify-self-end my-6">
            {editingCarousel ? "Edit Carousel" : "Add New Carousel"}
          </SheetTrigger>
          <SheetContent className="overflow-scroll">
            <SheetDescription>
              <SheetTitle>
                {editingCarousel
                  ? "Modify the carousel details below."
                  : "Create a new carousel."}
              </SheetTitle>
            </SheetDescription>
            <CarouselForm initialData={editingCarousel || undefined} />
          </SheetContent>
        </Sheet>
      )}
      <Carousel
        className="rounded-md"
        plugins={autoplayPlugin}
        opts={{
          loop: true,
        }}>
        <CarouselContent className="rounded-md">
          {(filteredCarousel || []).map((carousel) => (
            <CarouselItem
              key={carousel.carousel_id}
              style={{
                backgroundColor: carousel.background_color,
              }}
              className="relative grid grid-cols-3 rounded-md h-56 md:h-96 content-center justify-items-center">
              <div className="col-span-2 grid grid-flow-row space-y-4">
                <h1
                  className="text-xl text-start font-extrabold sm:text-5xl"
                  style={{
                    color: carousel.text_color,
                  }}>
                  {carousel.title}
                </h1>
                <strong
                  className="text-md block font-extrabold"
                  style={{
                    color: carousel.text_color,
                  }}>
                  {carousel.short_description}
                </strong>
                <p
                  className="mt-4 text-start max-w-lg sm:text-sm/relaxed line-clamp-2 md:line-clamp-none"
                  style={{
                    color: carousel.text_color,
                  }}>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Nesciunt illo tenetur fuga ducimus numquam ea!
                </p>
                <Button className="w-40">
                  <a href={carousel.link}>BUY NOW</a>
                </Button>
              </div>
              {/* Fixed aspect ratio container for the image */}
              <div className="aspect-w-16 aspect-h-9 overflow-hidden grid justify-self-end mr-2">
                <Image
                  loading="lazy"
                  className="h-full w-auto object-contain"
                  src={`data:image/jpeg;base64,${carousel.image}`}
                  alt={carousel.title}
                  height={200} // Fixed height
                  width={200} // Fixed width
                />
              </div>
              {isAdmin && (
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        ⋮
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingCarousel(carousel);
                          setIsDialogOpen(true);
                        }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDelete(Number(carousel.carousel_id))
                        }>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
