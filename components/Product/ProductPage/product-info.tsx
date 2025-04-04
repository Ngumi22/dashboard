"use client";

import { Heart, Minus, Plus, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { type MinimalProduct, useCartStore } from "@/app/store/cart";
import { useWishStore } from "@/app/store/wishlist";
import { useCompareStore } from "@/app/store/compare";
import { formatCurrency } from "@/lib/utils";

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
  const [localQuantity, setLocalQuantity] = useState(1); // Local state for quantity

  const addItemToWish = useWishStore((state) => state.addItemToWish);
  const removeItemFromWish = useWishStore((state) => state.removeItemFromWish);
  const wishlist = useWishStore((state) => state.wishItems);

  const addItemToCart = useCartStore((state) => state.addItemToCart);

  const addItemToCompare = useCompareStore((state) => state.addItemToCompare);
  const removeItemFromCompare = useCompareStore(
    (state) => state.removeItemFromCompare
  );
  const compareList = useCompareStore((state) => state.compareItems);

  const isInWishlist = wishlist.some((item) => item.id === id);
  const isInCompare = compareList.some((item) => item.id === id);

  const handleIncreaseQuantity = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (localQuantity < stockQuantity) {
      setLocalQuantity((prev) => prev + 1);
    }
  };

  const handleDecreaseQuantity = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (localQuantity > 1) {
      setLocalQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addItemToCart({
      id,
      name,
      price,
      main_image,
      ratings,
      discount,
      description,
      quantity: localQuantity, // Use localQuantity for cart
      created_at,
      specifications,
      tags,
    });
  };

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
          tags,
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
          tags,
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
        description: `${stockQuantity} units left`,
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
        <h1 className="text-xl font-bold">{name}</h1>

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
          <span className="text-sm font-bold text-primary">
            {formatCurrency(finalPrice)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
              <span className="text-sm">-{discount}%</span>
            </>
          )}
        </div>
        <div className="text-sm flex items-center gap-2">
          Availability:{" "}
          <span className="text-sm text-muted-foreground ">
            {stockStatus.description}
          </span>
          <span className={stockStatus.color}>{stockStatus.text}</span>
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
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecreaseQuantity}
              disabled={localQuantity <= 1}
              className="h-8 w-8">
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{localQuantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleIncreaseQuantity}
              disabled={localQuantity >= stockQuantity}
              className="h-8 w-8">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 bg-gray-900 hover:bg-yellow-500 transition-colors duration-300"
            disabled={stockQuantity === 0}
            onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleWishlistToggle}>
            <Heart
              className={`h-4 w-4 mr-2 ${
                isInWishlist ? "text-blue-500 fill-current" : ""
              }`}
            />
            {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>
        </div>

        <Button
          variant="outline"
          className="flex-1 mt-2"
          onClick={handleCompareToggle}>
          <Share2
            className={`h-4 w-4 mr-2 ${
              isInCompare ? "text-blue-500 fill-current" : ""
            }`}
          />
          {isInCompare ? "Remove from Compare" : "Add to Compare"}
        </Button>

        <ul>
          <li>Prices are subject to change without notice!</li>
          <li>All Prices are VAT Exclusive</li>
        </ul>
      </div>
    </div>
  );
}
