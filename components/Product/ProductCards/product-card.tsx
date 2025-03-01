"use client";

import { type MinimalProduct, useCartStore } from "@/app/store/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Share2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useMemo } from "react";

interface ProductCardProps extends MinimalProduct {
  orientation?: "vertical" | "horizontal";
}

const formatCurrency = (value: number, currency = "Ksh") => {
  return `${currency} ${value.toFixed(2)}`;
};

const RatingStars = ({ rating }: { rating: number | null | undefined }) => {
  const numericRating = Number(rating); // Ensure it's a number

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const fullStars = Math.floor(numericRating);
        const decimal = numericRating - fullStars;
        const isFull = index < fullStars;
        const isHalf = index === fullStars && decimal >= 0.5;

        return (
          <Star
            key={index}
            className={`h-3 w-3 ${
              isFull
                ? "text-yellow-400 fill-current"
                : isHalf
                ? "text-yellow-400 half-star"
                : "text-gray-300"
            }`}
          />
        );
      })}
      <span className="text-xs font-medium text-gray-600">
        {isNaN(numericRating)
          ? "Not yet rated"
          : `${numericRating.toFixed(1)}/5`}
      </span>
    </div>
  );
};

const isNewProduct = (created_at: string, daysThreshold = 30) => {
  if (!created_at) return false;

  const createdDate = new Date(created_at);
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  const isNew = isNewProduct(created_at || "");

  const discountedPrice = useMemo(() => {
    return price * (1 - (discount || 0) / 100);
  }, [price, discount]);

  return (
    <Link
      href={`/products/${id}`}
      className="group relative block overflow-hidden  w-[50vw] md:w-[33.33vw] lg:w-[25vw] xl:w-[20vw] transition-transform duration-300 ease-in-out hover:scale-105">
      <div className="relative aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8">
        <Image
          src={`data:image/jpeg;base64,${main_image}`}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105 aspect-3/2"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && (
            <Badge
              variant="secondary"
              className="bg-gray-200 text-black rounded-none">
              New
            </Badge>
          )}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {isOnSale && (
            <Badge variant="destructive" className="rounded-none">
              {Math.round(discount)}% OFF
            </Badge>
          )}
        </div>
        <div className="absolute bottom-2 right-2">
          <RatingStars rating={ratings} />
        </div>
      </div>

      <div className="relative bg-white p-4">
        <h3 className="font-bold text-gray-900 mb-1 truncate">{name}</h3>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(discountedPrice)}
            </span>
            {isOnSale && (
              <span className="text-sm font-medium text-gray-400 line-through">
                {formatCurrency(price)}
              </span>
            )}
          </div>
          {quantity > 0 ? (
            <Badge
              variant="outline"
              className="text-xs text-green-600 border-green-600 rounded-none">
              In Stock
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-xs text-red-600 border-red-600 rounded-none">
              Out of Stock
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={handleAddToCart}
            disabled={quantity === 0}
            className="w-full bg-gray-900 text-white hover:bg-yellow-500 transition-colors duration-300">
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button size="icon" variant="secondary" className="rounded-full">
          <Heart className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="rounded-full">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="rounded-full">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

export const ProductCardSkeleton = () => {
  return (
    <div className="relative flex w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.67rem)] lg:w-[calc(95%-0.75rem)] xl:w-[calc(90%-0.8rem)] flex-col bg-gray-100 animate-pulse rounded-lg overflow-hidden">
      <div className="w-full aspect-square bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
