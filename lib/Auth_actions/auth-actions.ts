"use server";

import { z } from "zod";
import { cookies } from "next/headers";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  getSession,
  refreshSession,
} from "./sessions";
import { hashPassword, isAllowedEmail, verifyPassword } from "./auth";
import { createUser, getUserByEmail, logAuthAttempt } from "./db";
import { rateLimit } from "./rate-limit";

// Define session data structure
export type SessionData = {
  userId: number;
  role: string;
  name: string;
  email: string;
};

// Define the signup form schema with validation rules
const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .trim(),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .trim(),
  password: z
    .string()
    .min(12, { message: "Be at least 12 characters long." })
    .regex(/[a-z]/, { message: "Contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
  role: z.enum(["user", "editor", "admin"], {
    message: "Please select a valid role.",
  }),
  csrf: z.string().min(1, { message: "CSRF token is required." }),
});

// Define the login form schema
const LoginFormSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .trim(),
  password: z.string().min(1, { message: "Password is required." }).trim(),
  csrf: z.string().min(1, { message: "CSRF token is required." }),
});

// Define the form state types
export type SignupFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    csrf?: string[];
  };
  message?: string;
};

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
    csrf?: string[];
  };
  message?: string;
};

export async function login(state: LoginFormState, formData: FormData) {
  try {
    const storedCsrfToken = cookies().get("XSRF-TOKEN")?.value;
    const submittedCsrfToken = formData.get("csrf")?.toString() || "";

    if (!storedCsrfToken || storedCsrfToken !== submittedCsrfToken) {
      return {
        errors: { csrf: ["Invalid or expired form submission."] },
        message: "Security validation failed.",
      };
    }

    // const ip =
    //   headers().get("x-forwarded-for") || headers().get("x-real-ip") || "";
    // const userAgent = headers().get("user-agent") || "";

    // Simple rate limiting (global)
    const rateLimitResult = await rateLimit("global-login", 10, 15 * 60);
    if (!rateLimitResult.success) {
      return { message: "Too many login attempts. Try again later." };
    }

    const validatedFields = LoginFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      csrf: submittedCsrfToken,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please correct the errors.",
      };
    }

    const { email, password } = validatedFields.data;
    const user = await getUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.password))) {
      return { message: "Invalid email or password." };
    }

    // Create session
    await createSession({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return { success: true, message: "Login successful" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred. Try again later." };
  }
}

export async function signup(state: SignupFormState, formData: FormData) {
  try {
    const storedCsrfToken = cookies().get("XSRF-TOKEN")?.value;
    const submittedCsrfToken = formData.get("csrf")?.toString() || "";

    if (!storedCsrfToken || storedCsrfToken !== submittedCsrfToken) {
      return {
        errors: { csrf: ["Invalid or expired form submission."] },
        message: "Security validation failed.",
      };
    }

    const validatedFields = SignupFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      csrf: submittedCsrfToken,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please correct the errors.",
      };
    }

    const { name, email, password, role } = validatedFields.data;
    const hashedPassword = await hashPassword(password);

    // Check if the email is in the allowlist
    const emailAllowed = await isAllowedEmail(email);
    if (!emailAllowed) {
      // Log unauthorized signup attempt
      await logAuthAttempt({
        email,
        success: false,
        reason: "Email not in allowlist",
      });

      return {
        errors: {
          email: ["This email is not authorized to create an account."],
        },
        message: "Email not authorized. Please contact your administrator.",
      };
    }

    try {
      await createUser({ name, email, password: hashedPassword, role });

      return { success: true, message: "Account created successfully!" };
    } catch (error: any) {
      if (error.message?.includes("Duplicate entry")) {
        return {
          errors: { email: ["This email is already registered."] },
          message: "Email already exists.",
        };
      }
      return { message: "An error occurred. Try again later." };
    }
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Unexpected error. Try again later." };
  }
}

export async function logout() {
  // Destroy the session (revoke refresh token and clear cookies)
  await destroySession();

  // Redirect to home page
  redirect("/login");
}

export async function getCurrentUser() {
  let session = await getSession();

  if (!session) {
    console.warn("Session could not be refreshed or is invalid.");
    return null;
  }

  const { userId, role, name, email } = session;
  return { id: userId, role, name, email };
}
