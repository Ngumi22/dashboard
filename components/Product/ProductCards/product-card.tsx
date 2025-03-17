"use client";

import { type MinimalProduct, useCartStore } from "@/app/store/cart";
import { useCompareStore } from "@/app/store/compare";
import { useWishStore } from "@/app/store/wishlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Heart, Share2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface ProductCardProps extends MinimalProduct {
  orientation?: "vertical" | "horizontal";
}

export const formatCurrency = (value: number, currency = "Ksh") => {
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
  const addItemToCart = useCartStore((state) => state.addItemToCart);
  const addItemToWish = useWishStore((state) => state.addItemToWish);
  const removeItemFromWish = useWishStore((state) => state.removeItemFromWish);
  const wishlist = useWishStore((state) => state.wishItems);

  const addItemToCompare = useCompareStore((state) => state.addItemToCompare);
  const removeItemFromCompare = useCompareStore(
    (state) => state.removeItemFromCompare
  );
  const compareList = useCompareStore((state) => state.compareItems);

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
          quantity,
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
          quantity,
          brand_name,
          created_at,
          specifications,
        });
  };

  const isOnSale = discount && discount > 0;
  const isNew = isNewProduct(created_at || "");

  const discountedPrice = useMemo(() => {
    return price * (1 - (discount || 0) / 100);
  }, [price, discount]);

  const productUrl = name ? `/products/${encodeURIComponent(name)}` : "#";

  return (
    <Link
      href={productUrl}
      className="group relative block overflow-hidden md:max-w-72 transition-transform duration-300 ease-in-out">
      <div className="relative aspect-square w-full rounded-lg bg-white/70 object-cover group-hover:opacity-75">
        <div className="flex h-full justify-center items-center p-2">
          <Image
            src={main_image}
            alt={name}
            height={200}
            width={200}
            objectFit="contain"
            className="transition-transform duration-300 group-hover:scale-105 aspect-3/2 bg-gray-200 rounded-lg"
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
                quantity,
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
        <Button size="icon" variant="secondary" className="rounded-full">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;

export const ProductCardSkeleton = () => {
  return (
    <div className="relative flex w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.67rem)] lg:w-[calc(95%-0.75rem)] xl:w-[calc(90%-0.8rem)] flex-col bg-gray-100 animate-pulse rounded-lg overflow-hidden">
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
