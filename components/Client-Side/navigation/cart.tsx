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
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function Cart() {
  const [isClient, setIsClient] = useState(false);

  // Ensure this runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const cartItems = useCartStore((state) => state.cartItems);
  const increaseQuantity = useCartStore((state) => state.increaseItemQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseItemQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartTotalAmount = useCartStore((state) => state.getTotalCost());
  const cartTotalQuantity = useCartStore((state) => state.getTotalQuantity());
  const validateCartItems = useCartStore((state) => state.validateCartItems);

  // Validate cart items when the component mounts
  useEffect(() => {
    if (isClient) {
      validateCartItems(); // ✅ No argument needed
    }
  }, [isClient, validateCartItems]);

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
        <div className="relative cursor-pointer flex items-center justify-center space-x-2 text-white">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-3 flex items-center justify-center font-bold text-center text-xs bg-white text-gray-900 h-5 w-5 rounded-full">
            {isClient ? cartTotalQuantity : 0}
          </span>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-96 overflow-y-scroll h-96">
        <ScrollArea className="p-2">
          {!isClient ? (
            <p>Loading...</p> // Placeholder during SSR
          ) : cartItems?.length === 0 ? (
            <div className="text-center">
              <p className="font-semibold my-2">Your Cart is empty</p>
              <Link className="flex justify-center gap-2 items-center" href="/">
                <ArrowLeft />
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            <div>
              {cartItems.map((cartItem) => (
                <div
                  className="grid grid-cols-3 gap-4 w-full border-b py-2 font-semibold"
                  key={cartItem.id}>
                  <Image
                    className="h-auto m-auto"
                    src={cartItem.main_image}
                    alt={cartItem.name}
                    height={50}
                    width={50}
                  />
                  <div className="grid items-start justify-start space-y-2 text-sm">
                    <div className="space-y-2">
                      <p>{cartItem.name}</p>
                      <p>{formatCurrency(cartItem.price)}</p>
                    </div>
                    <div className="grid grid-flow-col gap-2 py-1 px-3 border w-20 border-black rounded text-sm">
                      <button onClick={() => handleRemoveFromCart(cartItem.id)}>
                        -
                      </button>
                      <p className="text-center">{cartItem.quantity}</p>
                      <button onClick={() => handleIncreaseCart(cartItem.id)}>
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-sm">
                    {formatCurrency(cartItem.price * cartItem.quantity)}
                  </p>
                </div>
              ))}

              <div className="subtotal flex justify-between items-center gap-x-4 my-2">
                <p className="font-bold text-2xl">Subtotal:</p>
                <p className="font-bold text-xl">
                  {formatCurrency(cartTotalAmount)}
                </p>
              </div>

              <div className="flex justify-between items-center my-2">
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
