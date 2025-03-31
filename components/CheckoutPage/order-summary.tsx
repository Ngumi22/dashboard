"use client";

import { useState, useEffect } from "react";
import {
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Truck,
  CreditCard,
  Tag,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/app/store/cart";
import { useToast } from "@/components/ui/use-toast";

// Sample coupon codes
const AVAILABLE_COUPONS = [
  { code: "WELCOME10", discount: 0.1, type: "percentage" },
  { code: "SAVE20", discount: 0.2, type: "percentage" },
  { code: "FLAT15", discount: 15, type: "fixed" },
];

// Payment method icons
const PaymentIcons = () => (
  <div className="flex flex-wrap gap-2 justify-center mt-2">
    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
      Visa
    </div>
    <div className="w-10 h-6 bg-gradient-to-r from-red-600 to-orange-400 rounded flex items-center justify-center text-white text-xs font-bold">
      MC
    </div>
    <div className="w-10 h-6 bg-gradient-to-r from-green-600 to-green-400 rounded flex items-center justify-center text-white text-xs font-bold">
      MPesa
    </div>
    <div className="w-10 h-6 bg-gradient-to-r from-blue-800 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
      PayPal
    </div>
    <div className="w-10 h-6 bg-gradient-to-r from-gray-900 to-gray-700 rounded flex items-center justify-center text-white text-xs font-bold">
      Amex
    </div>
  </div>
);

export default function OrderSummary() {
  const [isLoading, setIsLoading] = useState(true);
  const cartItems = useCartStore((state) => state.cartItems);
  const getTotalCost = useCartStore((state) => state.getTotalCost);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: string;
  } | null>(null);
  const { toast } = useToast();

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

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate totals
  const subtotal = getTotalCost
    ? getTotalCost()
    : cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const isEmpty = cartItems.length === 0;
  const shipping = isEmpty ? 0 : 0;

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
  const tax = 0;
  const total = discountedSubtotal + shipping + tax;

  // Format cart items for WhatsApp message
  const formatWhatsAppMessage = () => {
    let message = "🛒 *New Order* 🛒\n\n*Items:*\n";

    // Add each item with details
    cartItems.forEach((item) => {
      message += `• ${item.name} × ${item.quantity} - Ksh ${(
        item.price * item.quantity
      ).toFixed(2)}\n`;
    });

    // Add summary
    message += "\n*Order Summary:*\n";
    message += `Subtotal: Ksh ${subtotal.toFixed(2)}\n`;

    if (discount > 0) {
      message += `Discount (${appliedCoupon?.code}): -Ksh ${discount.toFixed(
        2
      )}\n`;
    }

    message += `Shipping: Ksh ${shipping.toFixed(2)}\n`;
    message += `Tax: Ksh ${tax.toFixed(2)}\n`;
    message += `*Total: Ksh ${total.toFixed(2)}*\n`;

    message += "\n*Customer Details:*\n";
    message +=
      "Please provide your delivery details to complete the order. Thank you for shopping with us!";

    // Encode the message for URL
    return encodeURIComponent(message);
  };

  // Handle WhatsApp checkout
  const handleWhatsAppCheckout = () => {
    if (isEmpty) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    const message = formatWhatsAppMessage();
    // Replace with your actual WhatsApp business number
    const phoneNumber = "2547112725364";
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");

    toast({
      title: "WhatsApp Checkout",
      description: "Opening WhatsApp with your order details.",
    });
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-muted">
        <CardHeader className="pb-3">
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-muted sticky top-4">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <span>Order Summary</span>
          {!isEmpty && (
            <Badge variant="outline" className="font-semibold rounded-none">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {cartItems.length > 0 ? (
          <>
            <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm group">
                  <span className="truncate max-w-[70%] group-hover:text-primary transition-colors font-semibold">
                    {item.name} <span>× {item.quantity}</span>
                  </span>
                  <span className="font-semibold">
                    Ksh {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 font-semibold">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Subtotal
                </span>
                <span>Ksh {subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center font-semibold">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Discount (
                    {appliedCoupon.type === "percentage"
                      ? `${appliedCoupon.discount * 100}%`
                      : "Fixed"}
                    )
                  </span>
                  <span>-Ksh {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center font-semibold">
                  <Truck className="mr-2 h-4 w-4" />
                  Shipping
                </span>
                <span>Ksh {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center font-semibold">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Tax
                </span>
                <span>Ksh {tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-muted/30 -mx-6 px-6 py-3 mt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>Ksh {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
              size="lg">
              <MessageCircle className="mr-2 h-5 w-5" /> Quick Checkout with
              WhatsApp
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs mt-2">
              <ShieldCheck className="h-4 w-4" />
              <span>No account needed • Fast processing</span>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="flex flex-col items-center gap-2">
              <ShoppingCart className="h-12 w-12/50" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm">Add items to see your order summary</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col border-t pt-4">
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center">
              <LockKeyhole className="mr-2 h-4 w-4" />
              Secure Checkout
            </span>
            <span>256-bit SSL Encryption</span>
          </div>
          <PaymentIcons />
        </div>
      </CardFooter>
    </Card>
  );
}
