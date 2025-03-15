"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Heart } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useWishStore } from "@/app/store/wishlist";
import { useEffect, useState } from "react";

export default function WishList() {
  const [isClient, setIsClient] = useState(false);
  const wishItems = useWishStore((state) => state.wishItems);
  const clearWish = useWishStore((state) => state.clearWish);
  const wishTotalQuantity = useWishStore((state) => state.getTotalQuantity());

  // Ensure this runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer flex items-center justify-center space-x-2 text-white">
          <Heart className="h-6 w-6 text-white cursor-pointer" />
          <span className="absolute -top-2 -right-3 flex items-center justify-center font-bold text-center text-xs bg-white text-gray-900 h-5 w-5 rounded-full">
            {isClient ? wishTotalQuantity : 0}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        {!isClient ? (
          <p>Loading...</p> // Placeholder during SSR
        ) : (
          <ScrollArea className="rounded-md p-4">
            {wishItems.length === 0 ? (
              <div className="text-center">
                <p className="font-semibold my-4">Your Wishlist is empty</p>
                <Link
                  href="/"
                  className="flex justify-center gap-2 items-center">
                  <ArrowLeft />
                  <span>Start Adding Items</span>
                </Link>
              </div>
            ) : (
              <>
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

                <div className="flex justify-center w-full items-center my-4 gap-8">
                  <Button variant="outline" onClick={clearWish}>
                    Clear Wishlist
                  </Button>
                  <Button variant="default">
                    <Link href="/wishlist">View Wishlist</Link>
                  </Button>
                </div>
              </>
            )}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
