"use client";

import { useEffect, useState } from "react";
import { useWishStore } from "@/app/store/wishlist";
import ProductCard from "@/components/Product/ProductCards/product-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

export default function Wishlist() {
  const wishItems = useWishStore((state) => state.wishItems);
  const decreaseQuantity = useWishStore((state) => state.removeItemFromWish);
  const clearWish = useWishStore((state) => state.clearWish);

  const [wishTotalQuantity, setWishTotalQuantity] = useState(0);

  useEffect(() => {
    setWishTotalQuantity(useWishStore.getState().getTotalQuantity());
  }, [wishItems]); // Update when wishItems change

  const handleRemoveFromWish = (id: number) => {
    decreaseQuantity(id);
  };

  const handleClearWish = () => {
    clearWish();
  };

  if (wishItems.length === 0) {
    return (
      <div className="mt-[9.7rem] lg:mt-[12rem] bg-muted/80 p-2 sm:p-5 text-center">
        <div className="grid h-64 py-8">
          <p className="text-xl font-semibold">No products added to wish.</p>
          <Link href={"/"}>
            <Button>Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-[9.7rem] lg:mt-[12rem] bg-muted/80 p-5 text-center">
      <div className="pb-4">
        <h2 className="text-2xl font-bold">Your Favorite Items</h2>
        <p className="text-xl font-semibold">
          You have {wishTotalQuantity} products in your list
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-items-center">
        {wishItems.map((item) => (
          <div key={item.id}>
            <ProductCard
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              discount={item.discount}
              quantity={item.quantity}
              main_image={item.main_image}
              ratings={item.ratings}
            />
            <Button
              variant="default"
              size="lg"
              className="h-8 w-8 text-white hover:text-destructive"
              onClick={() => handleRemoveFromWish(item.id)}>
              <X className="h-4 w-4" />
              <span className="">Remove</span>
            </Button>
          </div>
        ))}
      </div>

      {wishTotalQuantity == 0 ? (
        ""
      ) : (
        <Button
          variant="destructive"
          size="lg"
          className="text-white"
          onClick={() => handleClearWish()}>
          <X className="h-4 w-4 mr-4" />
          <span className="">Clear Wishlist</span>
        </Button>
      )}
    </section>
  );
}
