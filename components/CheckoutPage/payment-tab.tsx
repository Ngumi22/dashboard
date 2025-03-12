"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, CreditCard, Check } from "lucide-react";
import OrderSummary from "./order-summary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCartStore } from "@/app/store/cart";

// Form schema
const formSchema = z.object({
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

interface PaymentTabProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function PaymentTab({ onBack, onComplete }: PaymentTabProps) {
  const clearCart = useCartStore((state) => state.clearCart);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  const handleCompleteOrder = () => {
    onComplete();
    // Clear cart and coupon after successful order
    clearCart();
    localStorage.removeItem("coupon");
  };

  return (
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
                    aria-invalid={form.formState.errors.city ? "true" : "false"}
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
                    aria-invalid={form.formState.errors.zip ? "true" : "false"}
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
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
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
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                    PayPal
                  </Label>
                  <div className="w-10 h-6 bg-blue-700 rounded"></div>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem value="apple" id="apple" />
                  <Label htmlFor="apple" className="flex-1 cursor-pointer">
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
                        form.formState.errors.cardNumber ? "true" : "false"
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
                        form.formState.errors.cardName ? "true" : "false"
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
                        form.formState.errors.expiry ? "true" : "false"
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
            <Button variant="outline" onClick={onBack}>
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
  );
}
