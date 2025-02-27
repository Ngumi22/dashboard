"use client";
import * as React from "react";
import Link from "next/link";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "../ui/button";

export default function CartItems() {
  const cart: any = [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-4 w-full">
      <Card className="md:col-span-3 p-8">
        {cart.cartItems.length === 0 ? (
          <div className="text-center">
            <p className="font-semibold ">Cart is empty</p>
            <Link
              className="flex justify-center gap-2 items-center my-auto text-center text-2xl"
              href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="fill-blue-500"
                className="bi bi-arrow-left fill-blue-500"
                viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                />
              </svg>
              <p>Start Shopping</p>
            </Link>
          </div>
        ) : (
          <div>
            {cart.cartItems?.map((cartItem: any) => (
              <div
                className="flex justify-between items-center my-2 border-b py-2 font-semibold"
                key={cartItem.id}>
                <Image
                  className="h-auto"
                  src={`data:image/jpeg;base64,${cartItem.images.main}`}
                  alt={cartItem.name}
                  height={80}
                  width={80}
                />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p>{cartItem.name}</p>
                    <p className="">Ksh {cartItem.price}</p>
                  </div>
                  <div className="grid grid-flow-col gap-2 py-2 px-3 border border-black rounded">
                    <button>-</button>
                    <p className="text-center">{cartItem.cartQuantity}</p>
                    <button>+</button>
                  </div>
                </div>
                <div className="grid space-y-8">
                  <p className="place-self-end">
                    Ksh {cartItem.price * cartItem.cartQuantity}.00
                  </p>
                  <button className="text-red-700 place-self-end relative group/item">
                    <Trash2
                      size={16}
                      strokeWidth={2}
                      className="stroke-1 stroke-black roup-hover/item:stroke-red"
                    />
                    <p className="absolute top-0 bottom-0 right-5 font-normal invisible group-hover/item:visible">
                      Remove
                    </p>
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <Link
                href="/"
                className="px-4 py-2 border border-black rounded  text-black">
                Continue Shopping
              </Link>
              <div className="flex justify-between items-center text-sm text-center my-2">
                <button className="flex justify-center items-center mr-auto px-4 py-2  bg-black rounded text-white">
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
      <Card className="md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="uppercase">Cart Totals</CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="subtotal flex justify-between items-center gap-x-4 my-2 border-b pb-2">
            <p className="uppercase">Subtotal:</p>
            <p className="uppercase">Ksh {cart.cartTotalAmount}.00</p>
          </div>

          <div className="">
            <h2 className="text-xl font-semibold uppercase mb-3">
              Delivery Charges
            </h2>
            <RadioGroup defaultValue="comfortable" className="text-sm">
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="default" id="r1" />
                <Label htmlFor="r1">
                  Delivery Within Nairobi County: KSh 300
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="comfortable" id="r2" />
                <Label htmlFor="r2">
                  Outside Nairobi Pay On Order: KSh 600
                </Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="compact" id="r3" />
                <Label htmlFor="r3">Compact</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="subtotal flex justify-between items-center gap-x-4 my-8">
            <p className="font-bold uppercase">Total</p>
            <p className="font-bold uppercase">Ksh {cart.cartTotalAmount}.00</p>
          </div>
          <div>
            <Button className="px-5 py-2 bg-black rounded text-white">
              Proceed to Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
