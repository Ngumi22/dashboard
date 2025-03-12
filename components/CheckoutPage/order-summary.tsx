"use client";

import { LockKeyhole } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useCartStore } from "@/app/store/cart";

// Sample coupon codes
const AVAILABLE_COUPONS = [
  { code: "WELCOME10", discount: 0.1, type: "percentage" },
  { code: "SAVE20", discount: 0.2, type: "percentage" },
  { code: "FLAT15", discount: 15, type: "fixed" },
];

export default function OrderSummary() {
  const cartItems = useCartStore((state) => state.cartItems);
  const getTotalCost = useCartStore((state) => state.getTotalCost);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: string;
  } | null>(null);

  // Load coupon from localStorage on mount
  useEffect(() => {
    const storedCoupon = localStorage.getItem("coupon");
    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
      } catch (e) {
        console.error("Failed to parse coupon from localStorage", e);
      }
    }
  }, []);

  // Calculate totals
  const subtotal = getTotalCost();
  const isEmpty = cartItems.length === 0;
  const shipping = isEmpty ? 0 : 4.99;

  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === "percentage") {
      return subtotal * appliedCoupon.discount;
    } else {
      return appliedCoupon.discount;
    }
  };

  const discount = calculateDiscount();
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + tax;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>Ksh {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Ksh {subtotal.toFixed(2)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Discount (
                  {appliedCoupon.type === "percentage"
                    ? `${appliedCoupon.discount * 100}%`
                    : "Fixed"}
                  )
                </span>
                <span>-Ksh {discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Ksh {shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>Ksh {tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>Ksh {total.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Your cart is empty
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <LockKeyhole className="mr-2 h-4 w-4" />
              Secure Checkout
            </span>
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="w-10 h-6 bg-blue-500 rounded"></div>
            <div className="w-10 h-6 bg-red-500 rounded"></div>
            <div className="w-10 h-6 bg-green-500 rounded"></div>
            <div className="w-10 h-6 bg-blue-700 rounded"></div>
            <div className="w-10 h-6 bg-gray-900 rounded"></div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
