"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MoreVertical } from "lucide-react";

import { CarouselForm } from "@/app/(backend)/dashboard/carousel/carousel";
import {
  HeroCarouselsProps,
  CarouselItemm,
} from "@/lib/actions/Carousel/carouselType";
import Carousel from "./Carousel";
import Image from "next/image";

export default function HeroCarousels({ isAdmin = true }: HeroCarouselsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const fetchCarousels = useStore((state) => state.fetchCarousels);
  const carousels = useStore((state) => state.carousels);
  const removeCarousel = useStore((state) => state.deleteCarouselState);

  const [editingCarousel, setEditingCarousel] = useState<CarouselItemm | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCarousels();
  }, [fetchCarousels]);

  const handleDelete = useCallback(
    async (carousel_id: number) => {
      try {
        await removeCarousel(carousel_id);
        toast({
          title: "Success",
          description: "Carousel deleted successfully",
        });
        fetchCarousels();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete carousel",
        });
      }
    },
    [removeCarousel, toast, fetchCarousels]
  );

  const handleEdit = useCallback((carousel: CarouselItemm) => {
    setEditingCarousel(carousel);
    setIsDialogOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingCarousel(null);
    setIsDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsDialogOpen(false);
    fetchCarousels();
  }, [fetchCarousels]);

  // Filtered carousel data with type safety
  const filteredCarousel = useMemo(() => {
    const items = isAdmin
      ? carousels || []
      : (carousels || [])
          .filter((carousel) => carousel.status === "active")
          .slice(0, 4);

    // Ensure all items have carousel_id and short_description is a string
    return items
      .filter(
        (item): item is CarouselItemm & { carousel_id: number } =>
          item.carousel_id !== undefined
      )
      .map((item) => ({
        ...item,
        short_description: item.short_description || "",
        description: item.description || "",
        link: item.link || "",
        image: typeof item.image === "string" ? item.image : "",
      }));
  }, [carousels, isAdmin]);

  return (
    <div className="grid gap-4">
      {isAdmin && (
        <>
          <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <SheetTrigger asChild>
              <Button
                onClick={handleAddNew}
                className="justify-self-end"
                variant="outline">
                {editingCarousel ? "Edit Carousel" : "Add New Carousel"}
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {editingCarousel ? "Edit Carousel" : "Create New Carousel"}
                </SheetTitle>
                <SheetDescription>
                  {editingCarousel
                    ? "Modify the carousel details below."
                    : "Fill in the details for a new carousel."}
                </SheetDescription>
              </SheetHeader>
              <CarouselForm initialData={editingCarousel || undefined} />
            </SheetContent>
          </Sheet>

          <div className="grid gap-2">
            {filteredCarousel.map((carousel) => (
              <div
                key={carousel.carousel_id}
                className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {carousel.image && typeof carousel.image === "string" && (
                    <Image
                      height={200}
                      width={200}
                      src={carousel.image}
                      alt={carousel.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{carousel.title}</h3>
                    <p className="text-sm text-gray-500">
                      Status: {carousel.status}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(carousel)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleDelete(carousel.carousel_id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="relative">
        <Carousel initialData={filteredCarousel} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
