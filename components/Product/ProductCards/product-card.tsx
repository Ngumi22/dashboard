"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  Eye,
  Heart,
  Minus,
  Plus,
  RefreshCcw,
  Share2,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { type MinimalProduct, useCartStore } from "@/app/store/cart";
import { useCompareStore } from "@/app/store/compare";
import { useWishStore } from "@/app/store/wishlist";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ProductCardProps extends MinimalProduct {
  orientation?: "vertical" | "horizontal";
}

const RatingStars = ({ rating }: { rating: number | null | undefined }) => {
  const numericRating = Number(rating);

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
            className={`h-4 w-4 ${
              isFull
                ? "text-gray-950 fill-current"
                : isHalf
                  ? "text-gray-950 half-star"
                  : "text-gray-600"
            }`}
          />
        );
      })}
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

const QuantitySelector = ({
  quantity,
  onIncrement,
  onDecrement,
  maxQuantity,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxQuantity: number;
}) => (
  <div className="space-y-2">
    <span className="font-medium">Quantity:</span>
    <div className="flex items-center border border-black rounded-none w-24">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDecrement}
        disabled={quantity <= 1}
        className="h-10 w-10">
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-center">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onIncrement}
        disabled={quantity >= maxQuantity}
        className="h-10 w-10">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

const ProductCard = ({
  id,
  sku,
  name,
  description,
  price,
  main_image,
  ratings,
  discount,
  quantity,
  brand_name,
  created_at,
  specifications,
  tags,
}: ProductCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogQuantity, setDialogQuantity] = useState(1); // Local state for dialog quantity

  // Zustand stores with shallow comparison
  const { addItemToWish, removeItemFromWish, wishItems } = useWishStore(
    (state) => ({
      addItemToWish: state.addItemToWish,
      removeItemFromWish: state.removeItemFromWish,
      wishItems: state.wishItems,
    })
  );

  const { addItemToCompare, removeItemFromCompare, compareItems } =
    useCompareStore((state) => ({
      addItemToCompare: state.addItemToCompare,
      removeItemFromCompare: state.removeItemFromCompare,
      compareItems: state.compareItems,
    }));

  const { addItemToCart, cartItems } = useCartStore((state) => ({
    addItemToCart: state.addItemToCart,
    cartItems: state.cartItems,
  }));

  const isInWishlist = wishItems.some((item) => item.id === id);
  const isInCompare = compareItems.some((item) => item.id === id);

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
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
            quantity,
            brand_name,
            created_at,
            specifications,
          });
    },
    [
      isInWishlist,
      id,
      name,
      price,
      main_image,
      ratings,
      discount,
      description,
      quantity,
      brand_name,
      created_at,
      specifications,
      addItemToWish,
      removeItemFromWish,
    ]
  );

  const handleCompareToggle = useCallback(
    (e: React.MouseEvent) => {
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
            quantity,
            brand_name,
            created_at,
            specifications,
          });
    },
    [
      isInCompare,
      id,
      name,
      price,
      main_image,
      ratings,
      discount,
      description,
      quantity,
      brand_name,
      created_at,
      specifications,
      addItemToCompare,
      removeItemFromCompare,
    ]
  );

  const incrementDialogQuantity = useCallback(() => {
    if (dialogQuantity < quantity) {
      setDialogQuantity((prev) => prev + 1);
    }
  }, [dialogQuantity, quantity]);

  const decrementDialogQuantity = useCallback(() => {
    if (dialogQuantity > 1) {
      setDialogQuantity((prev) => prev - 1);
    }
  }, [dialogQuantity]);

  const addToCartFromDialog = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      addItemToCart({
        id,
        name,
        price,
        main_image,
        ratings,
        discount,
        description,
        quantity: dialogQuantity, // Use dialogQuantity instead of quantity_count
        created_at,
        specifications,
      });
      setDialogOpen(false); // Close the dialog after adding to cart
    },
    [
      id,
      name,
      price,
      main_image,
      ratings,
      discount,
      description,
      dialogQuantity,
      created_at,
      specifications,
      addItemToCart,
    ]
  );

  const isOnSale = discount !== undefined && discount !== null && discount > 0;

  const isNew = isNewProduct(created_at || "");

  const discountedPrice = useMemo(() => {
    return price * (1 - (discount || 0) / 100);
  }, [price, discount]);

  const productUrl = name ? `/products/${encodeURIComponent(name)}` : "#";

  return (
    <>
      <Link
        href={productUrl}
        className="group relative block overflow-hidden md:max-w-72 transition-transform duration-300 ease-in-out">
        {/* Product Image Section */}
        <div className="relative aspect-square w-full bg-white object-cover group-hover:opacity-75">
          <div className="flex h-full justify-center items-center p-2">
            <Image
              src={main_image || "/placeholder.svg"}
              alt={name}
              height={200}
              width={200}
              className="transition-transform duration-300 scale-90 group-hover:scale-110 aspect-3/2 bg-gray-200 rounded-lg object-contain"
            />
          </div>
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

        {/* Product Details Section */}
        <div className="relative bg-white p-2">
          <h3 className="font-bold text-gray-900 mb-1 truncate">{name}</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(discountedPrice)}
            </span>
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
                  quantity: 1, // Default quantity for the card
                  created_at,
                  specifications,
                });
              }}
              disabled={quantity === 0}
              className="w-full bg-gray-900 text-white hover:bg-gray-300 transition-colors duration-300">
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={handleWishlistToggle}>
            <Heart
              className={`h-4 w-4 ${
                isInWishlist ? "text-blue-500 fill-current" : ""
              }`}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={handleCompareToggle}>
            <RefreshCcw
              className={`h-4 w-4 ${
                isInCompare ? "text-blue-500 fill-current" : ""
              }`}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDialogOpen(true);
            }}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      {/* Quick View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xs max-h-svh md:max-w-4xl p-0 border rounded-lg bg-white">
          <DialogClose className="absolute right-4 top-4 z-10 rounded-full p-2 bg-white/80 hover:bg-white"></DialogClose>

          <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-2">
            {/* Product Image Section */}
            <div className="relative flex items-center justify-center bg-gray-50">
              <div className="flex items-center justify-center w-full aspect-square py-2 m-auto">
                <Image
                  src={main_image}
                  alt={name}
                  height={300}
                  width={300}
                  className="h-72 object-contain w-auto m-auto"
                />
              </div>
              {isOnSale && (
                <Badge
                  variant="destructive"
                  className="absolute top-4 right-4 rounded-none text-md p-2">
                  {Math.round(discount)}% OFF
                </Badge>
              )}
              {isNew && (
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 bg-gray-200 text-black rounded-none text-md p-2">
                  New
                </Badge>
              )}
            </div>

            {/* Product Details Section */}
            <div className="grid gap-y-4 p-4">
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              <div className="flex gap-x-4 items-center">
                <p className="flex gap-x-4 items-center">
                  <RatingStars rating={ratings} />
                  <p>({Math.floor(ratings)} Reviews)</p>
                </p>
                <Separator orientation="vertical" />
                {brand_name && (
                  <p className="">
                    Brand: <span className="font-medium">{brand_name}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 my-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(discountedPrice)}
                </span>
                {isOnSale && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatCurrency(price)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground font-normal text-sm my-2">
                {description}
              </p>

              <div className="space-y-2">
                {quantity > 0 ? (
                  <p className="text-green-600">
                    In Stock ({quantity} units), ready to be shipped.
                  </p>
                ) : (
                  <p className="text-red-600">Out of Stock</p>
                )}
              </div>
              <Separator />
              <QuantitySelector
                quantity={dialogQuantity}
                onIncrement={incrementDialogQuantity}
                onDecrement={decrementDialogQuantity}
                maxQuantity={quantity}
              />

              <div className="">
                SKU: <span className="text-muted-foreground">{sku}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 my-2">
                <Button
                  className="flex-1 rounded-none text-white transition-colors duration-300"
                  disabled={quantity === 0}
                  onClick={addToCartFromDialog}>
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-none font-semibold border-black">
                  <Link href={productUrl}>View Details</Link>
                </Button>
              </div>

              <div className="space-y-2">
                <h2>Tags:</h2>
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-baseline">
                    <div className="flex flex-wrap gap-x-2">
                      {tags.map((tag: string, index: number) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="rounded-none border-black">
                          <Link
                            className="hover:underline"
                            href={`/products/tags/${encodeURIComponent(tag)}`}
                            passHref>
                            {tag}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;

export const ProductCardSkeleton = () => {
  return (
    <div className="relative block overflow-hidden md:max-w-72 transition-transform duration-300 ease-in-out">
      <div className="w-full aspect-square bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>

        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
