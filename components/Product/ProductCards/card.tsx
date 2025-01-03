"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Heart, BarChart2, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
}

export function ProductCard({
  name,
  description,
  price,
  image,
  rating,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="relative h-[10rem] sm:h-[18rem]">
        <div className="grid justify-items-center p-8">
          <Image
            src={`data:image/jpeg;base64,${image}`}
            alt={description}
            height={400}
            width={400}
            className="object-fill transition-all duration-300 ease-in-out group-hover:scale-105 overflow-hidden "
            priority
          />
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="rounded-full">
            <Eye className="h-4 w-4" />
            <span className="sr-only">Quick view</span>
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full">
            <BarChart2 className="h-4 w-4" />
            <span className="sr-only">Add to compare</span>
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full">
            <BarChart2 className="h-4 w-4" />
            <span className="sr-only">Add to compare</span>
          </Button>
        </div>
      </div>
      <CardContent className="relative h-[6rem] sm:h-[8rem]">
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
          <div className="mt-2 flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < rating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">({rating})</span>
          </div>
          <p className="mt-2 text-xl font-bold">${price}</p>
        </div>
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center justify-center transition-all duration-300 ${
            isHovered
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}>
          <Button className="w-full rounded-none">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
