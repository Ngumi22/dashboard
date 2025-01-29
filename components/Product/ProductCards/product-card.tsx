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
      icon: ShoppingCart,
      label: "Add to Cart",
      onClick: handleAddToCart,
    },
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
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-white transition-shadow duration-300 hover:shadow-lg ${
        orientation === "horizontal" ? "md:flex-row" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Image Container */}
      <div
        className={`relative aspect-square ${
          orientation === "horizontal" ? "md:w-1/3" : ""
        }`}>
        <Image
          src={`data:image/jpeg;base64,${images.mainImage}`}
          alt={name}
          fill
          className="object-contain transition-opacity duration-300 group-hover:opacity-90"
          sizes="(max-width: 568px) 40vw, 10vw"
        />

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute left-3 top-3 space-y-1">
            <div className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white">
              {discount}% OFF
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 shadow-sm">
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-sm font-medium text-gray-900">
            {Number(ratings).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div
        className={`flex flex-1 flex-col p-4 ${
          orientation === "horizontal" ? "md:w-2/3" : ""
        }`}>
        <div className="mb-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
            {name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                ${Number(price * (1 - (discount || 0) / 100)).toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${Number(price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {actionButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-gray-100"
                  aria-label={button.label}>
                  <button.icon className="h-4 w-4 text-gray-700" />
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="secondary"
            className="mt-4 w-full translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
