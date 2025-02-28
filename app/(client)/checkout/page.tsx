"use client";

import { CardFooter } from "@/components/ui/card";

import { useState, useEffect, SetStateAction } from "react";
import {
  Check,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  cardNumber: z.string().regex(/^\d{16}$/, "Invalid card number"),
  cardName: z.string().min(2, "Name on card must be at least 2 characters"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
});

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState("cart");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvv: "",
    },
  });

  // Sample coupon codes
  const availableCoupons = [
    { code: "WELCOME10", discount: 0.1, type: "percentage" },
    { code: "SAVE20", discount: 0.2, type: "percentage" },
    { code: "FLAT15", discount: 15, type: "fixed" },
  ];

  // Cart items with state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Vintage Denim Jacket",
      price: 89.99,
      quantity: 1,
      image: "/placeholder.jpg",
    },
    {
      id: 2,
      name: "Classic White Sneakers",
      price: 59.99,
      quantity: 2,
      image: "/placeholder.jpg",
    },
  ]);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = cartItems.length > 0 ? 4.99 : 0;

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

  // Update cart item quantity
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };

  // Clear entire cart
  const clearCart = () => {
    if (cartItems.length === 0) return;

    setCartItems([]);
    setAppliedCoupon(null);
    setCouponCode("");

    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  // Apply coupon code
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const coupon = availableCoupons.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase()
    );

    if (coupon) {
      setAppliedCoupon(coupon);
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
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");

    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order",
    });
  };

  const handleLogin = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
      toast({
        title: "Logged in successfully",
        description: "You can now proceed with your purchase",
      });
      setActiveTab("payment");
    } else {
      toast({
        title: "Login failed",
        description: "Please enter your email and password",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: SetStateAction<string>) => {
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

  const handleCompleteOrder = () => {
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your purchase",
    });
  };

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;

  // Disable proceeding to checkout if cart is empty
  useEffect(() => {
    if (isCartEmpty && activeTab === "cart") {
      // Do nothing, stay on cart tab
    } else if (isCartEmpty && activeTab !== "cart") {
      setActiveTab("cart");
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before proceeding",
        variant: "destructive",
      });
    }
  }, [isCartEmpty, activeTab, toast]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  // Order summary component to be reused
  const OrderSummary = () => (
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
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
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
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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

  return (
    <div className="container mx-auto py-8 max-w-8xl">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        Checkout
      </h1>

      <Progress value={getProgress()} className="mb-6" />

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
            disabled={isCartEmpty}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Checkout</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="flex items-center gap-2"
            disabled={isCartEmpty || !isLoggedIn}>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Your Cart</CardTitle>
                        <CardDescription>
                          Review your items before checkout
                        </CardDescription>
                      </div>
                      {cartItems.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearCart}
                          className="flex items-center gap-1">
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
                              className="flex items-center justify-between py-4 border-b">
                              <div className="flex items-center gap-4">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={80}
                                  height={80}
                                  className="rounded-md object-cover"
                                />
                                <div>
                                  <h3 className="font-medium">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    ${item.price.toFixed(2)} each
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none rounded-l-md"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                    disabled={item.quantity <= 1}>
                                    <Minus className="h-3 w-3" />
                                    <span className="sr-only">
                                      Decrease quantity
                                    </span>
                                  </Button>
                                  <div className="w-10 text-center">
                                    {item.quantity}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none rounded-r-md"
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }>
                                    <Plus className="h-3 w-3" />
                                    <span className="sr-only">
                                      Increase quantity
                                    </span>
                                  </Button>
                                </div>
                                <div className="text-right min-w-[80px]">
                                  <p className="font-medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeItem(item.id)}>
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remove item</span>
                                </Button>
                              </div>
                            </div>
                          ))}

                          <div className="pt-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <Label
                                  htmlFor="coupon-code"
                                  className="sr-only">
                                  Coupon Code
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="coupon-code"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={(e) =>
                                      setCouponCode(e.target.value)
                                    }
                                    disabled={!!appliedCoupon}
                                  />
                                  {appliedCoupon ? (
                                    <Button
                                      variant="outline"
                                      onClick={removeCoupon}>
                                      Remove
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="secondary"
                                      onClick={applyCoupon}>
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
                        <div className="text-center py-12">
                          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            Your cart is empty
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Looks like you havent added any items to your cart
                            yet.
                          </p>
                          <Button onClick={() => window.history.back()}>
                            Continue Shopping
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    {cartItems.length > 0 && (
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => window.history.back()}>
                          Continue Shopping
                        </Button>
                        <Button onClick={() => setActiveTab("checkout")}>
                          Proceed to Checkout{" "}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <OrderSummary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="checkout" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isLoggedIn
                          ? "Your Information"
                          : "Login or Create Account"}
                      </CardTitle>
                      <CardDescription>
                        {isLoggedIn
                          ? "Confirm your details"
                          : "You need to be logged in to complete your purchase"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoggedIn ? (
                        <form
                          onSubmit={form.handleSubmit(handleCompleteOrder)}
                          className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                {...form.register("firstName")}
                                aria-invalid={
                                  form.formState.errors.firstName
                                    ? "true"
                                    : "false"
                                }
                              />
                              {form.formState.errors.firstName && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.firstName.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                {...form.register("lastName")}
                                aria-invalid={
                                  form.formState.errors.lastName
                                    ? "true"
                                    : "false"
                                }
                              />
                              {form.formState.errors.lastName && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.lastName.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              {...form.register("email")}
                              aria-invalid={
                                form.formState.errors.email ? "true" : "false"
                              }
                            />
                            {form.formState.errors.email && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.email.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              {...form.register("phone")}
                              aria-invalid={
                                form.formState.errors.phone ? "true" : "false"
                              }
                            />
                            {form.formState.errors.phone && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.phone.message}
                              </p>
                            )}
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email</Label>
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="your@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Button type="submit" className="flex-1">
                              Login <LockKeyhole className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1">
                              Create Account
                            </Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("cart")}>
                        Back to Cart
                      </Button>
                      {isLoggedIn && (
                        <Button onClick={() => setActiveTab("payment")}>
                          Continue to Payment{" "}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <OrderSummary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment & Shipping</CardTitle>
                      <CardDescription>Complete your purchase</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <MapPin className="mr-2 h-5 w-5" /> Shipping Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                              id="address"
                              {...form.register("address")}
                              aria-invalid={
                                form.formState.errors.address ? "true" : "false"
                              }
                            />
                            {form.formState.errors.address && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.address.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="apt">Apt/Suite (optional)</Label>
                            <Input id="apt" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              {...form.register("city")}
                              aria-invalid={
                                form.formState.errors.city ? "true" : "false"
                              }
                            />
                            {form.formState.errors.city && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.city.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              {...form.register("state")}
                              aria-invalid={
                                form.formState.errors.state ? "true" : "false"
                              }
                            />
                            {form.formState.errors.state && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.state.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input
                              id="zip"
                              {...form.register("zip")}
                              aria-invalid={
                                form.formState.errors.zip ? "true" : "false"
                              }
                            />
                            {form.formState.errors.zip && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.zip.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              {...form.register("country")}
                              aria-invalid={
                                form.formState.errors.country ? "true" : "false"
                              }
                            />
                            {form.formState.errors.country && (
                              <p className="text-sm text-destructive">
                                {form.formState.errors.country.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Label htmlFor="shipping-notes">
                            Delivery Instructions (optional)
                          </Label>
                          <Textarea
                            id="shipping-notes"
                            placeholder="Leave package at the door"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <CreditCard className="mr-2 h-5 w-5" /> Payment Method
                        </h3>
                        <RadioGroup defaultValue="card" className="space-y-4">
                          <div className="flex items-center space-x-2 border rounded-md p-4">
                            <RadioGroupItem value="card" id="card" />
                            <Label
                              htmlFor="card"
                              className="flex-1 cursor-pointer">
                              Credit/Debit Card
                            </Label>
                            <div className="flex gap-2">
                              <div className="w-10 h-6 bg-blue-500 rounded"></div>
                              <div className="w-10 h-6 bg-red-500 rounded"></div>
                              <div className="w-10 h-6 bg-green-500 rounded"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-4">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label
                              htmlFor="paypal"
                              className="flex-1 cursor-pointer">
                              PayPal
                            </Label>
                            <div className="w-10 h-6 bg-blue-700 rounded"></div>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-4">
                            <RadioGroupItem value="apple" id="apple" />
                            <Label
                              htmlFor="apple"
                              className="flex-1 cursor-pointer">
                              Apple Pay
                            </Label>
                            <div className="w-10 h-6 bg-gray-900 rounded"></div>
                          </div>
                        </RadioGroup>

                        <div className="mt-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                {...form.register("cardNumber")}
                                placeholder="1234 5678 9012 3456"
                                aria-invalid={
                                  form.formState.errors.cardNumber
                                    ? "true"
                                    : "false"
                                }
                              />
                              {form.formState.errors.cardNumber && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.cardNumber.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardName">Name on Card</Label>
                              <Input
                                id="cardName"
                                {...form.register("cardName")}
                                placeholder="John Doe"
                                aria-invalid={
                                  form.formState.errors.cardName
                                    ? "true"
                                    : "false"
                                }
                              />
                              {form.formState.errors.cardName && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.cardName.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="expiry">Expiration Date</Label>
                              <Input
                                id="expiry"
                                {...form.register("expiry")}
                                placeholder="MM/YY"
                                aria-invalid={
                                  form.formState.errors.expiry
                                    ? "true"
                                    : "false"
                                }
                              />
                              {form.formState.errors.expiry && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.expiry.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                {...form.register("cvv")}
                                placeholder="123"
                                aria-invalid={
                                  form.formState.errors.cvv ? "true" : "false"
                                }
                              />
                              {form.formState.errors.cvv && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.cvv.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("checkout")}>
                        Back
                      </Button>
                      <Button onClick={form.handleSubmit(handleCompleteOrder)}>
                        Complete Order <Check className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <OrderSummary />
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
