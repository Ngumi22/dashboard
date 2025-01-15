"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
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
import { CarouselForm } from "@/app/(backend)/dashboard/carousel/carousel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getUniqueCarousels } from "@/lib/actions/Carousel/fetch";

interface HeroCarouselsProps {
  isAdmin?: boolean;
}

export interface Carousel {
  carousel_id?: number;
  title: string;
  short_description?: string;
  description?: string;
  link?: string;
  image?: File | string | null;
  status: "active" | "inactive";
  text_color: string;
  background_color: string;
}

export default function HeroCarousels({ isAdmin = false }: HeroCarouselsProps) {
  const { toast } = useToast();
  const fetchCarousels = useStore((state) => state.fetchCarousels);
  const carousels = useStore((state) => state.carousels);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const removeCarousel = useStore((state) => state.deleteCarouselState);

  const [editingCarousel, setEditingCarousel] = useState<Carousel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [data, setData] = useState<Carousel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getUniqueCarousels();
      setData(res);
    };
    fetchData();
  }, []);

  // Fetch carousels only once when the component mounts
  useEffect(() => {
    if (carousels.length === 0) {
      fetchCarousels();
    }
  }, [fetchCarousels, carousels.length]);

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
      return carousels;
    }
    return carousels.filter((banner) => banner.status === "active").slice(0, 4);
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
      {loading && error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-2 md:p-3 lg:p-5 lg:basis-64 flex-grow text-center shadow-lg bg-gray-400 animate-pulse h-[14rem]"></div>
        </div>
      ) : (
        <Carousel
          className="rounded-lg"
          plugins={autoplayPlugin}
          opts={{
            loop: true,
          }}>
          <CarouselContent className="rounded-lg">
            {filteredCarousel.map((carousel) => (
              <CarouselItem
                key={carousel.carousel_id}
                style={{
                  backgroundColor: carousel.background_color,
                }}
                className="relative h-52 md:h-full grid grid-cols-3 gap-4 py-4 md:py-[4.5rem] rounded-lg">
                <div className="col-span-2 grid grid-flow-row md:space-y-8 pl-5 space-y-2">
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
                <div className="-col-span-2 overflow-hidden grid justify-self-end mr-2">
                  <Image
                    loading="lazy"
                    className="h-full overflow-hidden md:h-80 my-auto w-auto object-contain"
                    src={`data:image/jpeg;base64,${carousel.image}`}
                    alt={carousel.title}
                    height={200}
                    width={200}
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
      )}
    </div>
  );
}
