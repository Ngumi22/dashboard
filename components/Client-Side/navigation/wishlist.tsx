"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { useWishStore } from "@/app/store/wishlist";
import { useEffect, useState } from "react";

export default function WishList() {
  const [isClient, setIsClient] = useState(false);
  const wishTotalQuantity = useWishStore((state) => state.getTotalQuantity());

  // Ensure this runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Link href={"/wishlist"} prefetch={true}>
      <div className="relative cursor-pointer flex items-center justify-center space-x-2 text-white">
        <Heart className="h-6 w-6 text-white cursor-pointer" />
        <span className="absolute -top-2 -right-3 flex items-center justify-center font-bold text-center text-xs bg-white text-gray-900 h-5 w-5 rounded-full">
          {isClient ? wishTotalQuantity : 0}
        </span>
      </div>
    </Link>
  );
}
