"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/lib/actions/Auth/login";
import { useEffect, useRef } from "react";

export default function LoginForm() {
  const [state, action] = useFormState(login, undefined);
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Redirect to dashboard on successful login
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state, router]);

  // Autofocus on the first input field with an error
  useEffect(() => {
    if (state?.errors?.email) {
      emailRef.current?.focus();
    } else if (state?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [state]);

  return (
    <div className="w-full lg:grid lg:min-h-[400px] lg:grid-cols-2 xl:min-h-[600px]">
      <form
        action={action}
        className="flex items-center justify-center md:h-screen">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  ref={emailRef}
                  aria-invalid={!!state?.errors?.email}
                />
                {state?.errors?.email && (
                  <p className="text-sm text-red-500">
                    {state.errors.email.join(", ")}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  ref={passwordRef}
                  aria-invalid={!!state?.errors?.password}
                />
              </div>
              {state?.errors?.password && (
                <p className="text-sm text-red-500">
                  {state.errors.password.join(", ")}
                </p>
              )}
              {/* Submit Button */}
              <LoginButton />
            </div>

            {/* Sign Up Link */}
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signUp" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Side Image */}
      <div className="hidden bg-muted lg:block">
        <Image
          src="/placeholder.svg"
          alt="Background"
          width="1920"
          height="1080"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

// Login Button Component (Handles Loading State)
function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} type="submit">
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}
