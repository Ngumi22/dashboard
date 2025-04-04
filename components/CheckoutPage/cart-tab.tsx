"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash,
  X,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import OrderSummary from "./order-summary";
import { useCartStore } from "@/app/store/cart";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

// Sample coupon codes
const AVAILABLE_COUPONS = [
  { code: "WELCOME10", discount: 0.1, type: "percentage" },
  { code: "SAVE20", discount: 0.2, type: "percentage" },
  { code: "FLAT15", discount: 15, type: "fixed" },
];

interface CartTabProps {
  onProceedToCheckout: () => void;
}

export default function CartTab({ onProceedToCheckout }: CartTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: string;
  } | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const cartItems = useCartStore((state) => state.cartItems);
  const increaseItemQuantity = useCartStore(
    (state) => state.increaseItemQuantity
  );
  const decreaseItemQuantity = useCartStore(
    (state) => state.decreaseItemQuantity
  );
  const removeItemFromCart = useCartStore((state) => state.removeItemFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const validateCartItems = useCartStore((state) => state.validateCartItems);

  useEffect(() => {
    const validateCart = async () => {
      try {
        await validateCartItems();
      } catch (error) {
        console.error("Error validating cart items:", error);
        toast({
          title: "Error",
          description: "Failed to validate cart items. Please try again.",
          variant: "destructive",
        });
      }
    };
    validateCart();
  }, [validateCartItems, toast]);

  // Load coupon from localStorage on mount
  useEffect(() => {
    const storedCoupon = localStorage.getItem("coupon");
    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
        const coupon = JSON.parse(storedCoupon);
        setCouponCode(coupon.code);
      } catch (e) {
        console.error("Failed to parse coupon from localStorage", e);
      }
    }
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Apply coupon code
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const coupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase()
    );

    if (coupon) {
      setAppliedCoupon(coupon);
      localStorage.setItem("coupon", JSON.stringify(coupon));
      setCouponError("");

      toast({
        title: "Coupon applied",
        description:
          coupon.type === "percentage"
            ? `${coupon.discount * 100}% discount applied to your order`
            : `$${coupon.discount.toFixed(2)} discount applied to your order`,
      });
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
      localStorage.removeItem("coupon");

      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is invalid",
        variant: "destructive",
      });
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("coupon");
    setCouponCode("");
    setCouponError("");

    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order",
    });
  };

  // Handle removing item from cart
  const handleRemoveItem = (id: number) => {
    removeItemFromCart(id);
  };

  // Handle clearing cart
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    clearCart();
    setAppliedCoupon(null);
    localStorage.removeItem("coupon");
    setCouponCode("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      <div className="lg:col-span-2">
        <Card className="grid space-y-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Cart</CardTitle>
              <CardDescription>
                Review your items before checkout
              </CardDescription>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCart}
                className="flex items-center gap-1 ">
                <Trash className="h-4 w-4" />
                <span className="hidden sm:inline">Clear Cart</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between py-4 border-b">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-20 w-20 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <Image
                        src={item.main_image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-l-md"
                          onClick={() => decreaseItemQuantity(item.id)}
                          disabled={item.quantity <= 1}>
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <div className="w-10 text-center">{item.quantity}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-r-md"
                          onClick={() => increaseItemQuantity(item.id)}>
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px] order-1 sm:order-none">
                        <p className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <X
                        className="h-4 w-4 cursor-pointer absolute top-0 right-4"
                        onClick={() => handleRemoveItem(item.id)}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <Label htmlFor="coupon-code" className="sr-only">
                        Coupon Code
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="coupon-code"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={!!appliedCoupon}
                        />
                        {appliedCoupon ? (
                          <Button
                            variant="outline"
                            onClick={handleRemoveCoupon}>
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={handleApplyCoupon}>
                            Apply
                          </Button>
                        )}
                      </div>
                      {couponError && (
                        <p className="text-sm text-destructive mt-1">
                          {couponError}
                        </p>
                      )}
                      {appliedCoupon && (
                        <p className="text-sm text-green-600 mt-1">
                          Coupon {appliedCoupon.code} applied!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Looks like you have not added any items to your cart yet.
                </p>
                <Button
                  onClick={() => router.push(`/`)}
                  className="w-full sm:w-auto max-w-xs mx-auto">
                  Continue Shopping
                </Button>
              </div>
            )}
          </CardContent>
          {cartItems.length > 0 && (
            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => router.push(`/`)}
                className="w-full sm:w-auto">
                Continue Shopping
              </Button>
              <Button
                onClick={onProceedToCheckout}
                className="w-full sm:w-auto">
                Proceed to Checkout <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <div className="lg:col-span-1">
        <OrderSummary />
      </div>
    </div>
  );
}
