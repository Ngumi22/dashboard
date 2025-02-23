"use client";

import { MinimalProduct, useCartStore } from "@/app/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Share2, Star } from "lucide-react";
import Image from "next/image";
import React, { useMemo } from "react";

interface ProductCardProps extends MinimalProduct {
  orientation?: "vertical" | "horizontal";
}

// Utility function to format currency
const formatCurrency = (value: number, currency: string = "Ksh") => {
  return `${currency} ${value.toFixed(2)}`;
};

// Reusable Rating Component
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const fullStars = Math.floor(rating);
        const decimal = rating - fullStars;
        const isFull = index < fullStars;
        const isHalf = index === fullStars && decimal >= 0.5;

        return (
          <Star
            key={index}
            className={`h-3 w-3 ${
              isFull
                ? "text-gray-900 fill-current" // Full star
                : isHalf
                ? "text-gray-900 half-star" // Half star
                : "text-gray-400" // Empty star
            }`}
          />
        );
      })}
      <span className="text-xs md:text-md font-medium text-gray-400">
        {rating ? `${rating}/5` : "Not yet rated"}
      </span>
    </div>
  );
};
// Utility function to check if a product is new
const isNewProduct = (created_at: string, daysThreshold = 100) => {
  if (!created_at) return false; // Ensure created_at exists

  const createdDate = new Date(created_at); // ✅ Use the original string
  if (isNaN(createdDate.getTime())) {
    console.error("Invalid created_at date:", created_at);
    return false;
  }

  const currentDate = new Date();
  const diffInTime = currentDate.getTime() - createdDate.getTime();
  const diffInDays = diffInTime / (1000 * 3600 * 24);

  return diffInDays <= daysThreshold;
};

export default function ProductCard({
  id,
  name,
  description,
  price,
  main_image,
  ratings,
  discount,
  quantity,
  created_at,
}: ProductCardProps) {
  const addItemToCart =
    useCartStore((state) => state.addItemToCart) || (() => {});

  const handleAddToCart = () => {
    const product = {
      id,
      name,
      price,
      main_image,
      ratings,
      discount,
      description,
      quantity,
      created_at,
    };
    addItemToCart(product);
  };

  const isOnSale = discount && discount > 0;
  const isNew = isNewProduct(created_at || ""); // ✅ Fix: Define isNew

  const discountedPrice = useMemo(() => {
    return price * (1 - (discount || 0) / 100);
  }, [price, discount]);

  return (
    <div className="group relative block overflow-hidden w-[50vw] md:w-[33.33vw] lg:w-[25vw] xl:w-[20vw]">
      <div className="relative">
        <Image
          src={`data:image/jpeg;base64,${main_image}`}
          alt={name}
          loading="lazy"
          objectFit="cover"
          height={100}
          width={100}
          className="aspect-square h-full w-full object-cover overflow-hidden"
        />
        {/* Rating */}
        <div className="absolute bottom-2 right-4 text-gray-900">
          <RatingStars rating={ratings} />
        </div>
      </div>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {isNew && (
          <span className="bg-yellow-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
            New
          </span>
        )}
      </div>

      {/* Dynamic Badges */}
      <div>
        {isOnSale && (
          <Badge
            variant="destructive"
            className="absolute top-4 right-4 text-xs">
            {Math.round(discount)}% OFF
          </Badge>
        )}
      </div>

      {/* Product Details */}
      <div className="relative bg-white py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{name}</h3>

        {/* Price Display */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-700 font-medium">
              {formatCurrency(discountedPrice)}
            </span>
            {isOnSale && (
              <>
                <span className="text-sm font-medium text-gray-400 line-through">
                  {formatCurrency(price)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          type="button"
          className="absolute -bottom-36 transition-all duration-300 group-hover:bottom-0 block w-full rounded-sm bg-yellow-400 text-sm font-medium hover:bg-yellow-500"
          aria-label="Add to Cart">
          <p className="transition hover:opacity-70">Add to Cart</p>
        </Button>
      </div>
    </div>
  );
}
export const ProductCardSkeleton = () => {
  return (
    <div className="relative flex w-[50vw] md:w-[33.33vw] lg:w-[25vw] xl:w-[20vw] flex-col bg-gray-200 animate-pulse rounded-md p-4">
      <div className="w-full aspect-square bg-gray-300 rounded-md"></div>
      <div className="mt-2 h-4 w-3/4 bg-gray-300 rounded"></div>
      <div className="mt-1 h-4 w-1/2 bg-gray-300 rounded"></div>
      <div className="mt-2 flex gap-2">
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};
