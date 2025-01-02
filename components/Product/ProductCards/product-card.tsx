"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Share2, Eye } from "lucide-react";
import { useCartStore } from "@/app/store/cart";
import useStore from "@/app/store/useStore";
import { object } from "zod";

interface ProductCardProps {
  product_id: string;
  name: string;
  description: string;
  price: number;
  images: {
    main_image: string;
  };
  rating: number;
  orientation?: "vertical" | "horizontal";
  discountPercentage?: number;
}

export default function ProductCard({
  product_id,
  name,
  description,
  price,
  images,
  rating,
  orientation = "vertical",
  discountPercentage,
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
        main_image: images.main_image,
      },
      rating,
      discountPercentage,
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

  const isOnSale = discountPercentage && discountPercentage > 0;

  return (
    <div
      className={`relative overflow-hidden shadow-lg transition-all duration-300 ${
        orientation === "horizontal" ? "sm:flex" : "flex flex-col"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div
        className={`relative ${
          orientation === "horizontal" ? "sm:w-3/4" : "h-3/4"
        }`}>
        <Image
          src={`data:image/jpeg;base64,${images.main_image}`}
          alt={name}
          layout="responsive"
          width={400}
          height={400}
          className="transition-transform duration-300 hover:scale-105 mt-16 object-contain"
        />
        {isOnSale && (
          <>
            <div className="absolute left-2 top-6 font-bold text-[#e16d00]">
              SALE
            </div>
            <div className="absolute right-2 top-6 font-bold text-black">
              -{discountPercentage}%
            </div>
          </>
        )}
        <div className="absolute bottom-1 left-2 flex items-center space-x-1 rounded bg-white px-2 py-1">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-semibold">
            {Number(rating).toFixed(1)}
          </span>
        </div>
      </div>
      <div
        className={`flex flex-col justify-between p-4 ${
          orientation === "horizontal" ? "sm:w-1/4" : "h-1/4"
        }`}>
        <div>
          <h2 className="mb-1 text-xl font-semibold">{name}</h2>
          <p className="mb-1 text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">
            {isOnSale && (
              <span className="mr-2 text-sm text-gray-500 line-through">
                ${Number(price).toFixed(2)}
              </span>
            )}
            ${Number(price * (1 - (discountPercentage || 0) / 100)).toFixed(2)}
          </div>
          {isHovered && (
            <div className="absolute right-2 top-2 flex flex-col space-y-2">
              {actionButtons.map((button, index) => (
                <div
                  key={index}
                  className="group relative"
                  onClick={button.onClick}>
                  <button className="bg-[#e16d00] p-2 text-gray-800 transition-all duration-300 hover:bg-black">
                    <button.icon size={20} />
                  </button>
                  <span className="absolute right-12 top-0 min-w-max rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-center">
                    {button.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
