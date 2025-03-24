"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signup } from "@/lib/Auth_actions/auth-actions";

const initialState = {
  message: "",
  errors: {
    name: [],
    email: [],
    password: [],
    role: [],
    csrf: [],
  },
};

export default function SignupForm() {
  const [state, formAction, isPending] = useFormState(signup, initialState);

  const [role, setRole] = useState("user");
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await fetch("/api/csrf-token");
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    };
    console.log("CSRF Token:", csrfToken);
    getCsrfToken();
  }, [csrfToken]);
  return (
    <Card>
      <form action={formAction}>
        <CardContent className="space-y-4 pt-6">
          {state?.message && (
            <Alert
              variant={
                state.message.includes("success") ? "default" : "destructive"
              }>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" />
            {state?.errors?.name?.length ? (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
            />

            {state?.errors?.email?.length ? (
              <p className="text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" />
            {state?.errors?.password?.length ? (
              <div className="text-sm text-destructive">
                <p>Password must:</p>
                <ul className="list-disc pl-5">
                  {state.errors.password.map((error: any) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.role?.length ? (
              <p className="text-sm text-destructive">{state.errors.role[0]}</p>
            ) : null}
          </div>

          {/* Hidden CSRF token field */}
          <Input type="hidden" name="csrf" value={csrfToken} />
          {state?.errors?.csrf?.length ? (
            <p className="text-sm text-destructive">{state.errors.csrf[0]}</p>
          ) : null}
        </CardContent>

        <CardFooter>
          <Button className="w-full" disabled={isPending || !csrfToken}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
