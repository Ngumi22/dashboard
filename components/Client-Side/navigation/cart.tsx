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
import { Button } from "@/components/ui/button";

const formatCurrency = (value: number, currency = "Ksh") => {
  return `${currency} ${value.toFixed(2)}`;
};

export default function Cart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const increaseQuantity = useCartStore((state) => state.increaseItemQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseItemQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartTotalAmount = useCartStore((state) => state.getTotalCost());
  const cartTotalQuantity = useCartStore((state) => state.getTotalQuantity());

  const handleIncreaseCart = (id: number) => {
    increaseQuantity(id);
  };

  const handleRemoveFromCart = (id: number) => {
    decreaseQuantity(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer flex items-center justify-center space-x-2 rounded-none text-white">
          <ShoppingCart className="h-6 w-6" />
          <p className="flex gap-x-2 text=xs md:text-md ">
            <span className="flex text-center items-center">
              {cartTotalQuantity}
            </span>
            <span className="hidden md:flex text-center items-center text-xs">
              Items
            </span>
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <ScrollArea className="rounded-md p-4">
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
                  key={cartItem.id}>
                  <Image
                    className="h-auto"
                    src={`data:image/jpeg;base64,${cartItem.main_image}`}
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
                      <button onClick={() => handleRemoveFromCart(cartItem.id)}>
                        -
                      </button>
                      <p className="text-center">{cartItem.quantity}</p>
                      <button onClick={() => handleIncreaseCart(cartItem.id)}>
                        +
                      </button>
                    </div>
                  </div>
                  <p>Ksh {cartItem.price * cartItem.quantity}</p>
                </div>
              ))}
              <div className="subtotal flex justify-between items-center gap-x-4 my-4">
                <p className="font-bold text-2xl">Subtotal:</p>
                <p className="font-bold text-xl">
                  {formatCurrency(cartTotalAmount)}
                </p>
              </div>

              <div className="flex justify-between items-center my-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="border px-4 py-2"
                  onClick={handleClearCart}>
                  Clear Cart
                </Button>
                <Button size="lg" className="border px-4 py-2">
                  <Link href="/checkout">Continue To Checkout</Link>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
