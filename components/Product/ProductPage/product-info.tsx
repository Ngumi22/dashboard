"use client";

import * as React from "react";
import { Heart, MinusCircle, PlusCircle, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Product } from "@/lib/actions/Product/productTypes";
import { useState } from "react";
import Link from "next/link"; // Import the Link component

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const finalPrice = product.price - (product.price * product.discount) / 100;

  // Determine status color and text based on product quantity
  const getStockStatus = (quantity: number) => {
    if (quantity > 10) {
      return {
        color: "bg-green-100 text-green-800",
        text: "In Stock",
        description: `${quantity} units available`,
      };
    } else if (quantity > 0) {
      return {
        color: "bg-yellow-100 text-yellow-800",
        text: "Low Stock",
        description: `Only ${quantity} units left`,
      };
    } else {
      return {
        color: "bg-red-100 text-red-800",
        text: "Out of Stock",
        description: "Currently unavailable",
      };
    }
  };

  const stockStatus = getStockStatus(product.quantity);

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${quantity} ${product.name} added to your cart`,
    });
  };

  const handleBuyNow = () => {
    // Implement checkout logic
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < product.ratings ? "fill-primary" : "fill-muted"
                }`}
              />
            ))}
          </div>
          <Badge variant="secondary">
            {product.ratings} ({product.ratings} reviews)
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-primary">${finalPrice}</span>
          {product.discount > 0 && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                ${product.price}
              </span>
              <Badge variant="destructive">-{product.discount}%</Badge>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {product.quantity}
          </span>
          <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
          <span className="text-sm text-muted-foreground">
            {stockStatus.description}
          </span>
        </div>
      </div>

      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/products/tags/${encodeURIComponent(tag)}`} // Encode the tag for the URL
              passHref>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Quantity</label>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}>
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.quantity}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            className="flex-1"
            size="lg"
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || product.status === "pending"}>
            Add to cart
          </Button>
          <Button
            className="flex-1"
            size="lg"
            variant="secondary"
            onClick={handleBuyNow}
            disabled={product.quantity === 0 || product.status === "approved"}>
            Buy it now
          </Button>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsWishlisted(!isWishlisted)}>
            <Heart
              className={`mr-2 h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`}
            />
            {isWishlisted ? "Wishlisted" : "Add to wishlist"}
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
