"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BarChart2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useWishStore } from "@/app/store/wishlist";

const formatCurrency = (value: number, currency = "Ksh") => {
  return `${currency} ${value.toFixed(2)}`;
};

export default function WishList() {
  const wishItems = useWishStore((state) => state.wishItems);
  const clearWish = useWishStore((state) => state.clearWish);
  const wishTotalQuantity = useWishStore((state) => state.getTotalQuantity());

  const handleClearWish = () => {
    clearWish();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer flex items-center justify-center space-x-2 rounded-none text-white">
          <BarChart2 className="h-6 w-6" />
          <p className="flex gap-x-2 text=xs md:text-md ">
            <span className="absolute top-1 right-1 flex text-center items-center">
              {wishTotalQuantity}
            </span>
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <ScrollArea className="rounded-md p-4">
          {wishItems?.length === 0 ? (
            <div className="text-center">
              <p className="font-semibold my-4">Your Wish is empty</p>
              <Link className="flex justify-center gap-2 items-center" href="/">
                <p className="flex justify-center gap-2 items-center">
                  {" "}
                  <ArrowLeft />
                  No Items in Your Wishlist
                </p>
              </Link>
            </div>
          ) : (
            <div>
              {wishItems.map((wishItem) => (
                <div
                  className="flex justify-between items-center my-2 border-b py-2 font-semibold"
                  key={wishItem.id}>
                  <Image
                    className="h-auto"
                    src={`data:image/jpeg;base64,${wishItem.main_image}`}
                    alt={wishItem.name}
                    height={80}
                    width={80}
                  />
                </div>
              ))}

              <div className="flex justify-between items-center my-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="border px-4 py-2"
                  onClick={handleClearWish}>
                  Clear Wish
                </Button>
                <Button size="lg" className="border px-4 py-2">
                  <Link href="/wishlist">Continue To Page</Link>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
