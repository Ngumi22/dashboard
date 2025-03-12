"use client";

import type React from "react";

import { useState, useEffect, createContext, useContext } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isEmpty: boolean;
  subtotal: number;
  total: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  appliedCoupon: { code: string; discount: number; type: string } | null;
  discount: number;
  shipping: number;
  tax: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Sample coupon codes
const AVAILABLE_COUPONS = [
  { code: "WELCOME10", discount: 0.1, type: "percentage" },
  { code: "SAVE20", discount: 0.2, type: "percentage" },
  { code: "FLAT15", discount: 15, type: "fixed" },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: string;
  } | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedCoupon = localStorage.getItem("coupon");

    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }

    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
      } catch (e) {
        console.error("Failed to parse coupon from localStorage", e);
      }
    }

    setInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, initialized]);

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    if (initialized) {
      if (appliedCoupon) {
        localStorage.setItem("coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("coupon");
      }
    }
  }, [appliedCoupon, initialized]);

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const isEmpty = items.length === 0;
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

  // Add item to cart
  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prevItems, item];
      }
    });
  };

  // Remove item from cart
  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;

    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Apply coupon
  const applyCoupon = (code: string) => {
    if (!code.trim()) return false;

    const coupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toLowerCase() === code.toLowerCase()
    );

    if (coupon) {
      setAppliedCoupon(coupon);
      return true;
    }

    return false;
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isEmpty,
        subtotal,
        total,
        applyCoupon,
        removeCoupon,
        appliedCoupon,
        discount,
        shipping,
        tax,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
