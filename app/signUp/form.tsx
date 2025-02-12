"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { signupFormSchema } from "@/lib/ZodSchemas/signUpSchema";
import { onSubmitAction } from "@/lib/actions/Auth/signUp";
import { useFormState, useFormStatus } from "react-dom";
import { Loader } from "lucide-react";

type FormState = {
  message: string;
  fields?: Record<string, string | File>;
  issues?: string[];
};

const initialState: FormState = {
  message: "",
};

export function StaffSignupForm() {
  const [cookies] = useCookies(["csrfToken"]);
  //const csrfToken = cookies.csrfToken;
  const router = useRouter();

  const [state, formAction] = useFormState<FormState, FormData>(
    onSubmitAction,
    initialState
  );
  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: "user",
      password: "",
      confirm_password: "",
      image: undefined,
    },
  });

  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (preview) {
      URL.revokeObjectURL(preview); // Clean up previous URL before setting a new one
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    const formData = new FormData();

    for (const key in data) {
      if (key === "image" && data.image) {
        formData.append(key, data.image[0]); // Add the file directly
      } else {
        formData.append(key, data[key as keyof typeof data]?.toString() || "");
      }
    }

    // formData.append("csrfToken", csrfToken);

    formAction(formData); // Wait for form submission result

    if (state?.message === "Signup successful") {
      router.push("/login");
    }
  };

  useEffect(() => {
    if (state?.message === "Signup successful") {
      router.push("/login");
    }
  }, [state?.message, router]);

  // Cleanup URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <section className="w-full lg:grid lg:grid-cols-2 gap-2 h-screen">
      <div className="flex-1 p-3 lg:p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-2 text-center text-purple-400">
            Create Your Account
          </h1>
          <Form {...form}>
            <form
              ref={formRef}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-2">
              {/* <Input type="hidden" name="csrfToken" value={csrfToken} /> */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name"
                          {...field}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          {...field}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+254 (700) 000 000"
                          {...field}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Profile Picture
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-24 h-24 border-2 border-purple-500">
                          <AvatarImage src={preview || ""} alt="Preview" />
                          <AvatarFallback className="bg-gray-700 text-gray-300">
                            PP
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleImageChange(e);
                            onChange(e.target.files);
                          }}
                          {...field}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Choose a profile picture.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                        className="bg-gray-800 border-gray-700 text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          {...field}
                          className="bg-gray-800 border-gray-700 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {state.message && (
                <div
                  className={`text-sm ${
                    state.message.toLowerCase().includes("successful")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {state.message}
                </div>
              )}
              <SignupButton />
            </form>
          </Form>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </section>
  );
}

function SignupButton() {
  const { pending } = useFormStatus();
  return (
    <Button aria-disabled={pending} type="submit" className="w-full">
      {pending ? "Signing you up..." : "Sign Up"}
    </Button>
  );
}
