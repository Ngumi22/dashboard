"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";
import { z } from "zod";
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
import { signUp } from "@/lib/actions";
import { signUpSchema } from "@/lib/utils";

type ErrorType = {
  first_name?: string[];
  last_name?: string[];
  role?: string[];
  email?: string[];
  password?: string[];
  password1?: string[];
  server?: string[];
};

const initialState = {
  message: "",
  errors: {} as ErrorType,
};

export default function SignUpForm() {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const validationResult = signUpSchema.safeParse(
      Object.fromEntries(formData)
    );

    if (!validationResult.success) {
      setState({
        message: "There was an error with your submission.",
        errors: validationResult.error.flatten().fieldErrors,
      });
      setPending(false);
      return;
    }

    const response = await signUp(formData);

    if ("errors" in response) {
      setState({
        message: "There was an error with your submission.",
        errors: response.errors as ErrorType,
      });
    } else {
      setState({ message: "Successfully created", errors: {} });
      router.push("/login"); // Redirect to login page
    }

    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" name="first_name" placeholder="Max" />
                {state.errors.first_name && (
                  <span className="text-red-500">
                    {state.errors.first_name[0]}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" name="last_name" placeholder="Robinson" />
                {state.errors.last_name && (
                  <span className="text-red-500">
                    {state.errors.last_name[0]}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="User" />
              {state.errors.role && (
                <span className="text-red-500">{state.errors.role[0]}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
              />
              {state.errors.email && (
                <span className="text-red-500">{state.errors.email[0]}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" />
              {state.errors.password && (
                <span className="text-red-500">{state.errors.password[0]}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password1">Confirm Password</Label>
              <Input id="password1" name="password1" type="password" />
              {state.errors.password1 && (
                <span className="text-red-500">
                  {state.errors.password1[0]}
                </span>
              )}
            </div>
            <SubmitButton pending={pending} />
          </div>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" aria-disabled={pending} className="w-full">
      {pending ? "Creating account..." : "Create an account"}
    </Button>
  );
}
