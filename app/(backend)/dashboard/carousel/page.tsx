"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Base64Image from "@/components/Data-Table/base64-image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCarouselMutations,
  useCarousels,
} from "@/lib/actions/Carousel/hooks";
import { Carousel } from "@/lib/actions/Carousel/carouselTypes";
import CarouselForm from "./carousel";

export default function CarouselPage() {
  const { data: carousels = [], isLoading } = useCarousels();
  const { deleteCarousel } = useCarouselMutations();
  const [editing, setEditing] = useState<Carousel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Memoize the carousels to prevent unnecessary re-renders
  const memoizedCarousels = useMemo(() => carousels, [carousels]);

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
  };

  return (
    <section className="py-4 px-2">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Carousels</h3>
        <Button
          className="text-xs"
          variant="outline"
          onClick={() => {
            setEditing(null);
            setIsDialogOpen(true);
          }}>
          Add New Carousel
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-sm md:max-w-lg h-screen overflow-scroll">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Carousel</DialogTitle>
          </DialogHeader>
          <DialogDescription>Carousel Form</DialogDescription>
          <CarouselForm initialData={editing || undefined} />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="m-4 flex flex-wrap items-center justify-around gap-2">
          {[1, 2, 3, 4].map((key) => (
            <div
              key={key}
              className="flex items-center justify-between border p-3 rounded-md w-96">
              <Skeleton className="w-[50px] h-[50px] rounded-md" />
              <div className="flex-1 space-y-2 ml-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-x-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="m-4 flex flex-wrap items-center justify-around gap-2">
          {memoizedCarousels.map((carousel) => (
            <div
              key={carousel.carousel_id}
              className="flex items-center justify-between border p-3 rounded-md w-96 h-36">
              <Base64Image
                src={carousel.image}
                alt={carousel.title}
                width={100}
                height={100}
              />
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {carousel.short_description}
                </p>
                <p className="text-xs font-medium text-gray-900">
                  {carousel.title}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    setEditing(carousel);
                    setIsDialogOpen(true);
                  }}>
                  Edit
                </Button>
                <Button
                  className="text-xs"
                  variant="destructive"
                  onClick={() => deleteCarousel(Number(carousel.carousel_id))}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
