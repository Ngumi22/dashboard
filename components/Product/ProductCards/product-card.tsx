"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Eye, Heart, Minus, Plus, Share2, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { type MinimalProduct, useCartStore } from "@/app/store/cart";
import { useCompareStore } from "@/app/store/compare";
import { useWishStore } from "@/app/store/wishlist";

interface ProductCardProps extends MinimalProduct {
  orientation?: "vertical" | "horizontal";
}

export const formatCurrency = (value: number, currency = "Ksh") => {
  return `${currency} ${value.toFixed(2)}`;
};

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
      <span className="text-xs font-bold text-gray-600">
        {isNaN(numericRating) ? "Not yet rated" : `${numericRating.toFixed(1)}`}
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
  <div className="flex items-center gap-4 mb-4">
    <span className="text-sm font-medium">Quantity:</span>
    <div className="flex items-center border rounded">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDecrement}
        disabled={quantity <= 1}
        className="h-8 w-8">
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-8 text-center">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onIncrement}
        disabled={quantity >= maxQuantity}
        className="h-8 w-8">
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  </div>
);

const ProductCard = ({
  id,
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

  const isOnSale = discount && discount > 0;
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
        <div className="relative aspect-square w-full rounded-lg bg-white/70 object-cover group-hover:opacity-75">
          <div className="flex h-full justify-center items-center p-2">
            <Image
              src={main_image || "/placeholder.svg"}
              alt={name}
              height={200}
              width={200}
              className="transition-transform duration-300 group-hover:scale-105 aspect-3/2 bg-gray-200 rounded-lg object-contain"
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
              className="w-full bg-gray-900 text-white hover:bg-yellow-500 transition-colors duration-300">
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
            <Share2
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] md:w-[100vw] p-0 border rounded-lg bg-white overflow-hidden">
          <DialogClose className="absolute right-4 top-4 z-10 rounded-full p-2 bg-white/80 hover:bg-white">
            <X className="h-4 w-4" />
            <span className="">Close</span>
          </DialogClose>

          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            {/* Product Image Section */}
            <div className="relative flex items-center justify-center p-6 bg-gray-50">
              <div className="relative w-full aspect-square">
                <Image
                  src={main_image || "/placeholder.svg"}
                  alt={name}
                  fill
                  className="object-contain"
                />
              </div>
              {isOnSale && (
                <Badge
                  variant="destructive"
                  className="absolute top-4 right-4 rounded-none">
                  {Math.round(discount)}% OFF
                </Badge>
              )}
              {isNew && (
                <Badge
                  variant="secondary"
                  className="absolute top-4 left-4 bg-gray-200 text-black rounded-none">
                  New
                </Badge>
              )}
            </div>

            {/* Product Details Section */}
            <div className="p-6 flex flex-col h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{name}</h2>

              <div className="flex items-center gap-2 mb-4">
                <RatingStars rating={ratings} />
                {brand_name && (
                  <span className="text-sm text-gray-500">
                    by <span className="font-medium">{brand_name}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(discountedPrice)}
                </span>
                {isOnSale && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatCurrency(price)}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-gray-600 line-clamp-4">{description}</p>
                <Link
                  href={productUrl}
                  className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                  Read more
                </Link>
              </div>

              <Tabs defaultValue="details" className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specifications">
                    Specifications
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-2">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>{description || "No detailed description available."}</p>
                    {quantity > 0 ? (
                      <p className="text-green-600">
                        In Stock: {quantity} available
                      </p>
                    ) : (
                      <p className="text-red-600">Out of Stock</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="specifications" className="mt-2">
                  {specifications && Object.keys(specifications).length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {Object.entries(specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b pb-1">
                          <span className="font-medium text-gray-700">
                            {key}
                          </span>
                          <span className="text-gray-600">
                            {value.specification_value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No specifications available.
                    </p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-auto">
                <QuantitySelector
                  quantity={dialogQuantity}
                  onIncrement={incrementDialogQuantity}
                  onDecrement={decrementDialogQuantity}
                  maxQuantity={quantity}
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex-1 bg-gray-900 hover:bg-yellow-500 transition-colors duration-300"
                    disabled={quantity === 0}
                    onClick={addToCartFromDialog}>
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
