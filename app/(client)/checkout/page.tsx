"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, User, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import CartTab from "@/components/CheckoutPage/cart-tab";
import CheckoutTab from "@/components/CheckoutPage/checkout-tab";
import PaymentTab from "@/components/CheckoutPage/payment-tab";
import { useCartStore } from "@/app/store/cart";

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState("cart");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const cartItems = useCartStore((state) => state.cartItems);
  const isEmpty = cartItems.length === 0;

  const handleTabChange = (value: string) => {
    if (value === "payment" && !isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please log in to proceed to payment",
        variant: "destructive",
      });
      setActiveTab("checkout");
    } else {
      setActiveTab(value);
    }
  };

  const handleLogin = (email: string, password: string) => {
    if (email && password) {
      setIsLoggedIn(true);
      toast({
        title: "Logged in successfully",
        description: "You can now proceed with your purchase",
      });
      setActiveTab("payment");
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Please enter your email and password",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleCompleteOrder = () => {
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your purchase",
    });
  };

  // Check if cart is empty
  useEffect(() => {
    if (isEmpty && activeTab === "cart") {
      // Do nothing, stay on cart tab
    } else if (isEmpty && activeTab !== "cart") {
      setActiveTab("cart");
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before proceeding",
        variant: "destructive",
      });
    }
  }, [isEmpty, activeTab, toast]);

  return (
    <div className="container mt-[9.7rem] lg:mt-[12rem] bg-muted/80 text-center">
      <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
        Checkout
      </h1>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cart" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
          </TabsTrigger>
          <TabsTrigger
            value="checkout"
            className="flex items-center gap-2"
            disabled={isEmpty}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Checkout</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="flex items-center gap-2"
            disabled={isEmpty || !isLoggedIn}>
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
        </TabsList>

        <div className="relative mt-6 min-h-[400px] overflow-hidden">
          <div
            className={`transition-all duration-200 ease-in-out ${
              activeTab === "cart"
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 absolute translate-y-4 invisible"
            }`}>
            <TabsContent value="cart" className="mt-6">
              <CartTab onProceedToCheckout={() => setActiveTab("checkout")} />
            </TabsContent>
          </div>

          <div
            className={`transition-all duration-200 ease-in-out ${
              activeTab === "checkout"
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 absolute translate-y-4 invisible"
            }`}>
            <TabsContent value="checkout" className="mt-6">
              <CheckoutTab
                isLoggedIn={isLoggedIn}
                onLogin={handleLogin}
                onBack={() => setActiveTab("cart")}
                onContinue={() => setActiveTab("payment")}
              />
            </TabsContent>
          </div>

          <div
            className={`transition-all duration-200 ease-in-out ${
              activeTab === "payment"
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 absolute translate-y-4 invisible"
            }`}>
            <TabsContent value="payment" className="mt-6">
              <PaymentTab
                onBack={() => setActiveTab("checkout")}
                onComplete={handleCompleteOrder}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <style jsx global>{`
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
        .duration-200 {
          transition-duration: 200ms;
        }
        .ease-in-out {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
