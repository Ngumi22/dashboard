"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/app/store/cart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Cart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const increaseQuantity = useCartStore((state) => state.increaseItemQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseItemQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartTotalAmount = useCartStore((state) => state.getTotalCost());
  const cartTotalQuantity = useCartStore((state) => state.getTotalQuantity());

  const handleIncreaseCart = (product_id: string) => {
    increaseQuantity(product_id);
  };

  const handleRemoveFromCart = (product_id: string) => {
    decreaseQuantity(product_id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer flex items-center justify-center space-x-2 rounded-none text-white">
          <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
          <p className="flex gap-x-2 text=xs md:text-md">
            {cartTotalQuantity}
            <span className="hidden md:flex text-center items-center text-xs">
              Items
            </span>
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <ScrollArea className="h-96 rounded-md p-4">
          {cartItems?.length === 0 ? (
            <div className="text-center">
              <p className="font-semibold my-4">Your Cart is empty</p>
              <Link className="flex justify-center gap-2 items-center" href="/">
                <p className="flex justify-center gap-2 items-center">
                  {" "}
                  <ArrowLeft />
                  Start Shopping
                </p>
              </Link>
            </div>
          ) : (
            <div>
              {cartItems.map((cartItem) => (
                <div
                  className="flex justify-between items-center my-2 border-b py-2 font-semibold"
                  key={cartItem.product_id}>
                  <Image
                    className="h-auto"
                    src={`data:image/jpeg;base64,${cartItem.images.main_image}`}
                    alt={cartItem.name}
                    height={80}
                    width={80}
                  />
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p>{cartItem.name}</p>
                      <p>Ksh {cartItem.price}</p>
                    </div>
                    <div className="grid grid-flow-col gap-2 py-2 px-3 border border-black rounded">
                      <button
                        onClick={() =>
                          handleRemoveFromCart(cartItem.product_id)
                        }>
                        -
                      </button>
                      <p className="text-center">{cartItem.quantity}</p>
                      <button
                        onClick={() => handleIncreaseCart(cartItem.product_id)}>
                        +
                      </button>
                    </div>
                  </div>
                  <p>Ksh {cartItem.price * cartItem.quantity}</p>
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button className="border px-4 py-2" onClick={handleClearCart}>
                  Clear Cart
                </button>
                <div className="subtotal flex justify-between items-center gap-x-4 my-4">
                  <p className="font-bold">Subtotal:</p>
                  <p className="font-bold">Ksh {cartTotalAmount}</p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
