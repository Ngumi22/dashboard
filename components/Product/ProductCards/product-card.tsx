"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Share2, Eye } from "lucide-react";
import { MinimalProduct, useCartStore } from "@/app/store/cart";
import { Button } from "@/components/ui/button";

interface ProductCardProps extends MinimalProduct {
  orientation?: "vertical" | "horizontal";
}

export default function ProductCard({
  product_id,
  name,
  description,
  price,
  images,
  ratings,
  orientation = "vertical",
  discount,
  quantity,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Access the addItemToCart function from Zustand
  const addItemToCart =
    useCartStore((state) => state.addItemToCart) || (() => {});

  // Define individual action handlers
  const handleAddToCart = () => {
    const product = {
      product_id,
      name,
      price,
      images: {
        mainImage: images.mainImage,
      },
      ratings,
      discount,
      description,
      quantity,
    };
    addItemToCart(product);
  };

  const handleAddToWishlist = () => {
    console.log(`Added ${name} to wishlist`);
  };

  const handleShare = () => {
    console.log(`Sharing ${name}`);
  };

  const handleQuickView = () => {
    console.log(`Quick view of ${name}`);
  };

  const actionButtons = [
    {
      icon: Heart,
      label: "Add to Wishlist",
      onClick: handleAddToWishlist,
    },
    {
      icon: Share2,
      label: "Share",
      onClick: handleShare,
    },
    {
      icon: Eye,
      label: "Quick View",
      onClick: handleQuickView,
    },
  ];

  const isOnSale = discount && discount > 0;

  return (
    <div
      className={`group/item relative flex w-[50vw] md:w-[33.33vw] lg:w-[25vw] xl:w-[20vw] flex-col overflow-hidden bg-white transition-shadow duration-300 hover:shadow-lg ${
        orientation === "horizontal" ? "md:flex-row" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Image Container */}
      <div
        className={`relative aspect-square bg-gray-300 py-2 grid justify-items-center ${
          orientation === "horizontal" ? "md:w-1/3" : ""
        }`}>
        <Image
          src={`data:image/jpeg;base64,${images.mainImage}`}
          alt={name}
          width={200}
          height={200}
          className="m-auto object-contain transform transition ease-in-out delay-150 duration-300 group-hover/item:-translate-y-1 group-hover/item:scale-105"
        />

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute left-3 top-3 space-y-1">
            <div className=" bg-white px-2 py-1 text-xs font-medium text-gray-900 text-md">
              {discount}% OFF
            </div>
          </div>
        )}

        {/* Icons/ Action buttons */}

        <div className="absolute invisible group-hover/item:visible top-4 right-4 transform translate-x-2 opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100 flex flex-col items-center gap-2">
          {actionButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-gray-100 group/edit"
              aria-label={button.label}>
              <button.icon className="h-4 w-4 text-gray-700" />
              {/* Label visible on hover */}
              <span className="absolute right-full mr-2 whitespace-nowrap bg-white px-2 py-1 text-xs text-gray-900 opacity-0 transition-opacity group-hover/edit:opacity-100">
                {button.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div
        className={`flex flex-1 flex-col gap-y-2 py-2 ${
          orientation === "horizontal" ? "md:w-2/3" : ""
        }`}>
        <div className="space-y-2">
          <h3 className="line-clamp-1 text-xs md:text-md lg:text-lg font-medium text-gray-900">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            {ratings === 0 || ratings === null || ratings === undefined ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="h-3.5 w-3.5 text-gray-400" // Empty stars
                  />
                ))}
                <span className="text-xs md:text-md font-medium text-gray-400">
                  Not yet rated
                </span>
              </>
            ) : (
              <>
                {[...Array(5)].map((_, index) => {
                  const fullStars = Math.floor(ratings);
                  const decimal = ratings - fullStars;
                  let adjustedFullStars = fullStars;
                  let hasHalf = false;

                  // Adjust for 0.6+ decimals to show full star
                  if (decimal >= 0.6) {
                    adjustedFullStars += 1;
                  }
                  // Show half star only for 0.5-0.59 range
                  else if (decimal >= 0.5) {
                    hasHalf = true;
                  }

                  const isFull = index < adjustedFullStars;
                  const isHalf = index === adjustedFullStars && hasHalf;

                  return (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${
                        isFull
                          ? "text-gray-900 fill-current" // Full star
                          : isHalf
                          ? "text-gray-900 half-star" // Half star
                          : "text-gray-400" // Empty star
                      }`}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs md:text-md font-medium">
                Ksh {Number(price * (1 - (discount || 0) / 100)).toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-xs md:text-md font-medium text-gray-400 line-through">
                  Ksh {Number(price).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          className="absolute bottom-0 right-0 transform translate-y-2 mx-auto group-hover/item:translate-y-0 group-hover/item:opacity-100 w-full rounded-none opacity-0 transition-all duration-300"
          onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
