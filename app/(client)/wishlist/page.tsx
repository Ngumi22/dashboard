"use client";

import { useEffect, useState } from "react";
import { useWishStore } from "@/app/store/wishlist";
import ProductCard from "@/components/Product/ProductCards/product-card";

export default function Wishlist() {
  const wishItems = useWishStore((state) => state.wishItems);
  const increaseQuantity = useWishStore((state) => state.increaseItemQuantity);
  const decreaseQuantity = useWishStore((state) => state.decreaseItemQuantity);
  const clearWish = useWishStore((state) => state.clearWish);

  const [wishTotalQuantity, setWishTotalQuantity] = useState(0);

  useEffect(() => {
    setWishTotalQuantity(useWishStore.getState().getTotalQuantity());
  }, [wishItems]); // Update when wishItems change

  const handleIncreaseWish = (id: number) => {
    increaseQuantity(id);
  };

  const handleRemoveFromWish = (id: number) => {
    decreaseQuantity(id);
  };

  const handleClearWish = () => {
    clearWish();
  };

  return (
    <section className="px-8 text-center mt-14">
      <h2 className="text-2xl font-bold">Your Favorite Items</h2>
      <p className="text-xl font-semibold">
        You have {wishTotalQuantity} items in your wishlist
      </p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-items-center">
        {wishItems.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            discount={item.discount}
            quantity={item.quantity}
            main_image={item.main_image}
            ratings={item.ratings}
          />
        ))}
      </div>
    </section>
  );
}
