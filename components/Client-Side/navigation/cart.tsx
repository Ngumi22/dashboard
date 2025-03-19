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

const formatCurrency = (value: number, currency = "Ksh") => {
  return `${currency} ${value.toFixed(2)}`;
};

export default function Cart() {
  const [isClient, setIsClient] = useState(false);
  const [validProductIds, setValidProductIds] = useState<number[]>([]);

  // Ensure this runs only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch valid product IDs from the database
  useEffect(() => {
    const fetchValidProductIds = async () => {
      try {
        const response = await fetch("/api/products/ids"); // Adjust the API endpoint as needed
        const data = await response.json();
        setValidProductIds(data.ids);
      } catch (error) {
        console.error("Failed to fetch valid product IDs", error);
      }
    };

    fetchValidProductIds();
  }, []);

  const cartItems = useCartStore((state) => state.cartItems);
  const increaseQuantity = useCartStore((state) => state.increaseItemQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseItemQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartTotalAmount = useCartStore((state) => state.getTotalCost());
  const cartTotalQuantity = useCartStore((state) => state.getTotalQuantity());
  const validateCartItems = useCartStore((state) => state.validateCartItems);

  // Validate cart items whenever validProductIds change
  useEffect(() => {
    if (validProductIds.length > 0) {
      validateCartItems(validProductIds);
    }
  }, [validProductIds, validateCartItems]);

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

      <PopoverContent className="w-96">
        <ScrollArea className="rounded-md p-4">
          {!isClient ? (
            <p>Loading...</p> // Placeholder during SSR
          ) : cartItems?.length === 0 ? (
            <div className="text-center">
              <p className="font-semibold my-4">Your Cart is empty</p>
              <Link className="flex justify-center gap-2 items-center" href="/">
                <ArrowLeft />
                <span>Start Shopping</span>
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
                    src={cartItem.main_image}
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
