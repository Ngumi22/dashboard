"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/lib/actions";
import Image from "next/image";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginForm() {
  const router = useRouter();
  const [state, action] = useFormState(login, undefined);

  useEffect(() => {
    if (state?.success) {
      // Redirect to dashboard on successful login
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <div className="w-full lg:grid lg:min-h-[400px] lg:grid-cols-2 xl:min-h-[600px]">
      <form
        action={action}
        className="flex items-center justify-center md:h-screen">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="john@example.com"
                  />
                </div>
                {state?.errors?.email && (
                  <p className="text-sm text-red-500">
                    {state.errors.email.join(", ")}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" />
                </div>
                {state?.errors?.password && (
                  <p className="text-sm text-red-500">
                    {state.errors.password.join(", ")}
                  </p>
                )}

                {state?.errors?.server && (
                  <p className="text-sm text-red-500">
                    {state.errors.server.join(", ")}
                  </p>
                )}
              </div>
              <LoginButton />
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signUp" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button aria-disabled={pending} type="submit">
      {pending ? "Loading..." : "Login"}
    </Button>
  );
}
