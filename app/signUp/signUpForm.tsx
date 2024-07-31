"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormState, useFormStatus } from "react-dom";
import { signUp } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define password validation criteria
const passwordCriteria = [
  { regex: /.{8,}/, message: "At least 8 characters" },
  { regex: /[A-Z]/, message: "At least one uppercase letter" },
  { regex: /[a-z]/, message: "At least one lowercase letter" },
  { regex: /[0-9]/, message: "At least one number" },
  { regex: /[^A-Za-z0-9]/, message: "At least one special character" },
];

export default function SignupForm() {
  const router = useRouter();
  const [state, action] = useFormState(signUp, undefined);
  const [password, setPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordMatchError, setPasswordMatchError] = useState("");

  useEffect(() => {
    if (state?.success) {
      router.push("/login");
    } else if (state?.errors?.email) {
      console.error("Invalid email");
    } else if (state?.errors?.password) {
      console.error("Password does not meet criteria");
    } else if (password !== password1) {
      console.error("Passwords do not match");
    }
  }, [state, router, password, password1]);

  useEffect(() => {
    const errors = passwordCriteria
      .filter((criteria) => !criteria.regex.test(password))
      .map((criteria) => criteria.message);

    setPasswordErrors(errors);

    // Check if passwords match
    if (password1 && password !== password1) {
      setPasswordMatchError("Passwords do not match.");
    } else {
      setPasswordMatchError("");
    }
  }, [password, password1]);

  return (
    <form action={action}>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" placeholder="John" />
              </div>
              {state?.errors?.first_name && (
                <p className="text-sm text-red-500">
                  {state.errors.first_name}
                </p>
              )}
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" placeholder="Doe" />
              </div>
              {state?.errors?.last_name && (
                <p className="text-sm text-red-500">{state.errors.last_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="User" />
            </div>
            {state?.errors?.role && (
              <p className="text-sm text-red-500">{state.errors.role}</p>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="john@example.com" />
            </div>
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email}</p>
            )}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password1">Confirm Password</Label>
              <Input
                id="password1"
                name="password1"
                type="password"
                onChange={(e) => setPassword1(e.target.value)}
              />
            </div>
            {passwordErrors.length > 0 && (
              <div className="text-sm">
                <p>Password must:</p>
                <ul>
                  {passwordCriteria.map((criteria) => (
                    <li
                      key={criteria.message}
                      className={
                        passwordErrors.includes(criteria.message)
                          ? "text-red-500"
                          : "text-green-500"
                      }>
                      {criteria.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {passwordMatchError && (
              <p className="text-sm text-red-500">{passwordMatchError}</p>
            )}
            {state?.errors?.server && (
              <p className="text-sm text-red-500">{state.errors.server}</p>
            )}
            <SignupButton />
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

function SignupButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} type="submit" className="mt-2 w-full">
      {pending ? "Loading..." : "Sign Up"}
    </Button>
  );
}
