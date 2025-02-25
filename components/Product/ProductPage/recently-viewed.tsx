"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RecentlyViewedProps {
  currentProductId: string;
}

export default function RecentlyViewed({
  currentProductId,
}: RecentlyViewedProps) {
  // This would normally come from your data store
  const recentProducts = [
    {
      id: "1",
      name: "iPhone 13",
      price: 999,
      image: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Samsung Galaxy S21",
      price: 899,
      image: "/placeholder.svg",
    },
    {
      id: "3",
      name: "Google Pixel 6",
      price: 799,
      image: "/placeholder.svg",
    },
    {
      id: "4",
      name: "OnePlus 9 Pro",
      price: 899,
      image: "/placeholder.svg",
    },
  ].filter((product) => product.id !== currentProductId);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recently Viewed</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="mt-6 flex gap-6 overflow-x-auto scrollbar-hide">
        {recentProducts.map((product) => (
          <Card key={product.id} className="min-w-[200px]">
            <CardContent className="p-4">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-square relative mb-4">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="mt-1 text-primary">${product.price}</p>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
