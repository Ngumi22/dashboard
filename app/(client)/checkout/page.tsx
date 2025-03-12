"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, User, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Progress indicator
  const getProgress = () => {
    switch (activeTab) {
      case "cart":
        return 33;
      case "checkout":
        return 66;
      case "payment":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-8xl">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}>
            <TabsContent value="cart" className="mt-6">
              <CartTab onProceedToCheckout={() => setActiveTab("checkout")} />
            </TabsContent>

            <TabsContent value="checkout" className="mt-6">
              <CheckoutTab
                isLoggedIn={isLoggedIn}
                onLogin={handleLogin}
                onBack={() => setActiveTab("cart")}
                onContinue={() => setActiveTab("payment")}
              />
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <PaymentTab
                onBack={() => setActiveTab("checkout")}
                onComplete={handleCompleteOrder}
              />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
