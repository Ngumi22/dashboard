"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Github, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { login } from "@/lib/Auth_actions/auth-actions";

const initialState = {
  message: "",
  errors: { email: [], password: [], csrf: [] },
};

export default function LoginForm() {
  const [state, formAction, isPending] = useFormState(login, initialState);
  const [csrfToken, setCsrfToken] = useState("");
  const router = useRouter();

  // Fetch CSRF Token
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/csrf-token");
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    })();
  }, []);

  // Redirect on successful login
  useEffect(() => {
    if (state?.success) router.push("/dashboard");
  }, [state, router]);

  // OAuth Login Handler
  const handleOAuthLogin = useCallback((provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Choose your preferred login method</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error / Success Message */}
        {state?.message && (
          <Alert
            className={
              state.message.includes("success") ? "bg-green-500" : "bg-red-500"
            }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* OAuth Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthLogin("github")}>
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthLogin("google")}>
            <GoogleIcon className="mr-2 h-4 w-4" /> Google
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Email/Password Login Form */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
            />
            {state?.errors?.email?.[0] && (
              <p className="text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" />
            {state?.errors?.password?.[0] && (
              <p className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Hidden CSRF Token Field */}
          <Input type="hidden" name="csrf" value={csrfToken} />
          {state?.errors?.csrf?.[0] && (
            <p className="text-sm text-destructive">{state.errors.csrf[0]}</p>
          )}

          {/* Submit Button */}
          <Button className="w-full" disabled={isPending || !csrfToken}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" /> Login with Email
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground mt-2">
          Don’t have an account?{" "}
          <Link href="/signUp" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

// Extracted Google Icon Component
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
