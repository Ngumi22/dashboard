"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { CarouselForm } from "@/app/(backend)/dashboard/carousel/carousel";
import {
  HeroCarouselsProps,
  CarouselItemm,
} from "@/lib/actions/Carousel/carouselType";
import Carousel from "./Carousel";

export default function HeroCarousels({ isAdmin = true }: HeroCarouselsProps) {
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
        await removeCarousel(carousel_id);
        toast({
          variant: "destructive",
          title: "Delete Carousel",
          description: `Carousel with ID ${carousel_id} deleted successfully.`,
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
        router.push("/dashboard/carousel");
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

      <div className="relative">
        {/* Pass the filtered carousel data and isAdmin prop to the Carousel component */}
        <Carousel />

        {isAdmin && (
          <div className="absolute top-4 right-4 z-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filteredCarousel.map((carousel) => (
                  <React.Fragment key={carousel.carousel_id}>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingCarousel(carousel);
                        setIsDialogOpen(true);
                      }}>
                      Edit {carousel.title}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDelete(Number(carousel.carousel_id))
                      }>
                      Delete {carousel.title}
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
