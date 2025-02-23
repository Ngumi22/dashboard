import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Share2, Star } from "lucide-react";
import Image from "next/image";
import React, { useMemo } from "react";

// Utility function to format currency
const formatCurrency = (value: number, currency: string = "Ksh") => {
  return `${currency} ${value.toFixed(2)}`;
};

// Reusable Rating Component
const RatingStars = ({ rating }: { rating: number }) => (
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

// Reusable Action Buttons Component
const ActionButtons = () => {
  const actions = [
    { icon: Heart, label: "Add to Wishlist" },
    { icon: Share2, label: "Share" },
    { icon: Eye, label: "Quick View" },
  ];

  return (
    <div className="absolute -right-16 bottom-0 mr-3 mb-4 space-y-2 transition-all duration-300 group-hover:right-4 top-12 flex flex-col">
      {actions.map((action, index) => (
        <div key={index} className="group/action relative">
          <button
            className="z-10 rounded-full bg-white p-1.5 text-gray-900 transition hover:text-gray-900/75"
            aria-label={action.label}>
            <action.icon className="h-4 w-4" />
          </button>
          {/* Label on hover */}
          <span className="absolute right-full mr-2 whitespace-nowrap bg-white px-2 py-1 text-xs text-gray-900 opacity-0 transition-opacity group-hover/action:opacity-100 shadow-sm rounded-sm">
            {action.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Caard() {
  const ratings = 4.3;
  const price = 100;
  const discount = 4;
  const isNew = true; // Change this to dynamically control "New" badge
  const isOnSale = discount > 0;

  // Memoize the discounted price calculation
  const discountedPrice = useMemo(() => {
    return price * (1 - (discount || 0) / 100);
  }, [price, discount]);

  return (
    <section className="container my-4">
      <div className="group relative block overflow-hidden w-[50vw] md:w-[33.33vw] lg:w-[25vw] xl:w-[20vw]">
        {/* Image Container */}
        <div className="relative">
          <Image
            height={100}
            width={100}
            src="https://images.unsplash.com/photo-1592921870789-04563d55041c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=50"
            alt="Robot Toy"
            className="aspect-square w-full rounded-sm object-cover"
          />

          {/* Rating */}
          <div className="absolute bottom-2 right-4 text-gray-900">
            <RatingStars rating={ratings} />
          </div>

          {/* Action Buttons */}
          <ActionButtons />
        </div>

        {/* Dynamic Badges */}
        <div>
          {isNew && (
            <span className="absolute top-4 left-4 bg-yellow-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap">
              New
            </span>
          )}
          {isOnSale && (
            <Badge
              variant="destructive"
              className="absolute top-4 right-4 text-xs">
              {Math.round(discount)}% OFF
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="relative bg-white p-2">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Robot Toy</h3>

          {/* Price Display */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-700 font-medium">
                {formatCurrency(discountedPrice)}
              </span>
              {isOnSale && (
                <span className="text-sm font-medium text-gray-400 line-through">
                  {formatCurrency(price)}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Add to Cart Button */}
        <Button
          type="button"
          className="absolute -bottom-36 transition-all duration-300 group-hover:bottom-2 block w-full rounded-sm bg-yellow-400 text-sm font-medium hover:bg-yellow-500"
          aria-label="Add to Cart">
          <p className="transition hover:opacity-70">Add to Cart</p>
        </Button>
      </div>
    </section>
  );
}
