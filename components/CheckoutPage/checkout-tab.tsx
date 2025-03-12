"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockKeyhole, ChevronRight } from "lucide-react";
import OrderSummary from "./order-summary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});

interface CheckoutTabProps {
  isLoggedIn: boolean;
  onLogin: (email: string, password: string) => boolean;
  onBack: () => void;
  onContinue: () => void;
}

export default function CheckoutTab({
  isLoggedIn,
  onLogin,
  onBack,
  onContinue,
}: CheckoutTabProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {isLoggedIn ? "Your Information" : "Login or Create Account"}
            </CardTitle>
            <CardDescription>
              {isLoggedIn
                ? "Confirm your details"
                : "You need to be logged in to complete your purchase"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      aria-invalid={
                        form.formState.errors.firstName ? "true" : "false"
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
                        form.formState.errors.lastName ? "true" : "false"
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
                  <Button type="button" variant="outline" className="flex-1">
                    Create Account
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back to Cart
            </Button>
            {isLoggedIn && (
              <Button onClick={onContinue}>
                Continue to Payment <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <OrderSummary />
      </div>
    </div>
  );
}
