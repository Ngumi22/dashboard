"use client";

import * as React from "react";
import { Heart, MinusCircle, PlusCircle, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { MinimalProduct, useCartStore } from "@/app/store/cart";
import { useWishStore } from "@/app/store/wishlist";
import { useCompareStore } from "@/app/store/compare";

export default function ProductInfo({
  id,
  sku,
  name,
  description,
  price,
  main_image,
  ratings,
  discount,
  brand_name,
  created_at,
  specifications,
  tags,
  quantity: stockQuantity, // Rename to stockQuantity for clarity
}: MinimalProduct) {
  const addItemToCart = useCartStore((state) => state.addItemToCart);
  const addItemToWish = useWishStore((state) => state.addItemToWish);
  const removeItemFromWish = useWishStore((state) => state.removeItemFromWish);
  const wishlist = useWishStore((state) => state.wishItems);
  const increaseQuantity = useCartStore((state) => state.increaseItemQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseItemQuantity);

  const [cartQuantity, setCartQuantity] = useState(1); // Track cart quantity separately

  const handleIncreaseCartQuantity = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setCartQuantity((prev) => prev + 1);
  };

  const handleDecreaseCartQuantity = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setCartQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const addItemToCompare = useCompareStore((state) => state.addItemToCompare);
  const removeItemFromCompare = useCompareStore(
    (state) => state.removeItemFromCompare
  );
  const compareList = useCompareStore((state) => state.compareItems);
  const cartTotalQuantity = useCartStore((state) => state.getTotalQuantity());

  const isInWishlist = wishlist.some((item) => item.id === id);
  const isInCompare = compareList.some((item) => item.id === id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isInWishlist
      ? removeItemFromWish(id)
      : addItemToWish({
          id,
          name,
          price,
          main_image,
          ratings,
          discount,
          description,
          quantity: stockQuantity, // Use stockQuantity for wishlist
          brand_name,
          created_at,
          specifications,
        });
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isInCompare
      ? removeItemFromCompare(id)
      : addItemToCompare({
          id,
          name,
          price,
          main_image,
          ratings,
          discount,
          description,
          quantity: stockQuantity, // Use stockQuantity for compare
          brand_name,
          created_at,
          specifications,
        });
  };

  const finalPrice = price - (price * discount) / 100;

  // Determine status color and text based on product stock quantity
  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity > 10) {
      return {
        color: "bg-green-100 text-green-800",
        text: "In Stock",
        description: `${stockQuantity} units available`,
      };
    } else if (stockQuantity > 0) {
      return {
        color: "bg-yellow-100 text-yellow-800",
        text: "Low Stock",
        description: `Only ${stockQuantity} units left`,
      };
    } else {
      return {
        color: "bg-red-100 text-red-800",
        text: "Out of Stock",
        description: "Currently unavailable",
      };
    }
  };

  const stockStatus = getStockStatus(stockQuantity);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="text-xs text-muted-foreground">SKU: {sku}</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < ratings ? "fill-primary" : "fill-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm">
            {ratings} ({ratings} reviews)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-primary">
            Ksh {finalPrice}
          </span>
          {discount > 0 && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                Ksh {price}
              </span>
              <span className="text-sm">-{discount}%</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 p-2">
          <span className={stockStatus.color}>{stockStatus.text}</span>
          <span className="text-sm text-muted-foreground ">
            {stockStatus.description}
          </span>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <p>Tags: </p>
          {tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/products/tags/${encodeURIComponent(tag)}`}
              passHref>
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Quantity</label>
          <div className="mt-2 flex items-center gap-2">
            <Button
              onClick={handleDecreaseCartQuantity}
              size="icon"
              disabled={cartQuantity <= 1}>
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{cartQuantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncreaseCartQuantity}
              disabled={cartQuantity >= stockQuantity}>
              {" "}
              {/* Disable if cartQuantity exceeds stockQuantity */}
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            className="flex-1"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              addItemToCart({
                id,
                name,
                price,
                main_image,
                ratings,
                discount,
                description,
                quantity: cartQuantity, // Pass cartQuantity to the cart
                created_at,
                specifications,
              });
            }}
            disabled={stockQuantity === 0}>
            Add to cart
          </Button>
          <Button
            className="flex-1"
            size="lg"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              addItemToCart({
                id,
                name,
                price,
                main_image,
                ratings,
                discount,
                description,
                quantity: cartQuantity, // Pass cartQuantity to the cart
                created_at,
                specifications,
              });
            }}
            disabled={stockQuantity === 0}>
            Buy it now
          </Button>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleWishlistToggle}>
            <Heart
              className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-red-500" : ""}`}
            />
            {isInWishlist ? "Wishlisted" : "Add to wishlist"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCompareToggle}>
            <Share2 className="mr-2 h-4 w-4" />
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}
