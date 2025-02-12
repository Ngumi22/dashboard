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
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Check, Loader, ShieldClose } from "lucide-react";

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
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Sign Up Successful",
        description:
          "A link has been sent to your email. Please verify your account.",
      });
    } else if (state?.errors?.email) {
      toast({
        title: "Error",
        description: state.errors.email.join(", "),
        variant: "destructive",
      });
    } else if (state?.errors?.server) {
      toast({
        title: "Error",
        description: state.errors.server.join(", "),
        variant: "destructive",
      });
    }
  }, [state, toast]);

  useEffect(() => {
    const errors = passwordCriteria
      .filter((criteria) => !criteria.regex.test(password))
      .map((criteria) => criteria.message);
    setPasswordErrors(errors);
  }, [password]);

  useEffect(() => {
    if (password !== password1) {
      setPasswordMatchError("Passwords do not match");
    } else {
      setPasswordMatchError("");
    }
  }, [password, password1]);

  const passwordStrength =
    ((passwordCriteria.length - passwordErrors.length) /
      passwordCriteria.length) *
    100;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your details below to create your account and get started
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" placeholder="John" />
              {state?.errors?.first_name && (
                <p className="text-sm text-red-500">
                  {state.errors.first_name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" placeholder="Doe" />
              {state?.errors?.last_name && (
                <p className="text-sm text-red-500">{state.errors.last_name}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" placeholder="User" />
            {state?.errors?.role && (
              <p className="text-sm text-red-500">{state.errors.role}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
            />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Progress value={passwordStrength} className="w-full h-2" />
          </div>
          <div className="space-y-2">
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
              <p className="font-semibold">Password must have:</p>
              <ul className="list-none pl-0 mt-1 space-y-1">
                {passwordCriteria.map((criteria) => (
                  <li
                    key={criteria.message}
                    className={`flex items-center ${
                      passwordErrors.includes(criteria.message)
                        ? "text-red-500"
                        : "text-green-500"
                    }`}>
                    {passwordErrors.includes(criteria.message) ? (
                      <ShieldClose className="w-4 h-4 mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <SignupButton />
          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

function SignupButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" className="w-full">
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Signing Up...
        </>
      ) : (
        "Sign Up"
      )}
    </Button>
  );
}
