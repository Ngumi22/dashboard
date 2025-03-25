"use server";

import { z } from "zod";
import { headers } from "next/headers";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  getCsrfToken,
  getSession,
} from "./sessions";
import { hashPassword, isAllowedEmail, verifyPassword } from "./auth";
import { createUser, getUserByEmail, logAuthAttempt } from "./db";
import { rateLimit } from "./rate-limit";

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

export async function signup(state: SignupFormState, formData: FormData) {
  try {
    // Get CSRF token from cookies
    const storedCsrfToken = getCsrfToken();
    console.log("CSRF Token SERVER:", storedCsrfToken);
    const submittedCsrfToken = formData.get("csrf")?.toString() || "";

    // Validate CSRF token
    if (!storedCsrfToken || (await storedCsrfToken) !== submittedCsrfToken) {
      return {
        errors: {
          csrf: [
            "Invalid or expired form submission. Please refresh and try again.",
          ],
        },
        message:
          "Security validation failed. Please refresh the page and try again.",
      };
    }
    console.log("CSRF Token:", submittedCsrfToken);

    // Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      csrf: submittedCsrfToken,
    });

    // If form validation fails, return errors
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please correct the errors in the form.",
      };
    }

    const { name, email, password, role } = validatedFields.data;

    // Get client IP and user agent for security logging
    const ip =
      headers().get("x-forwarded-for") || headers().get("x-real-ip") || "";
    const userAgent = headers().get("user-agent") || "";

    // Check if the email is in the allowlist
    const emailAllowed = await isAllowedEmail(email);
    if (!emailAllowed) {
      // Log unauthorized signup attempt
      await logAuthAttempt({
        email,
        success: false,
        ip,
        userAgent,
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
      // Hash the password with a strong algorithm
      const hashedPassword = await hashPassword(password);

      // Create the user in the database
      await createUser({
        name,
        email,
        password: hashedPassword,
        role,
      });

      // Log successful signup
      await logAuthAttempt({
        email,
        success: true,
        ip,
        userAgent,
      });

      return {
        success: true,
        message: "Account created successfully! You can now log in.",
      };
    } catch (error: any) {
      console.error("Error creating user:", error);

      // Log failed signup
      await logAuthAttempt({
        email,
        success: false,
        ip,
        userAgent,
        reason: error.message,
      });

      // Check for duplicate email error
      if (
        error.message?.includes("Duplicate entry") ||
        error.code === "ER_DUP_ENTRY"
      ) {
        return {
          errors: {
            email: ["This email is already registered."],
          },
          message: "An account with this email already exists.",
        };
      }

      return {
        message:
          "An error occurred while creating your account. Please try again.",
      };
    }
  } catch (error) {
    console.error("Signup error:", error);

    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function login(state: LoginFormState, formData: FormData) {
  try {
    // Get CSRF token from cookies
    const storedCsrfToken = getCsrfToken();
    const submittedCsrfToken = formData.get("csrf")?.toString() || "";

    console.log("CSRF Token from Cookies (Server):", storedCsrfToken);
    console.log("CSRF Token from FormData:", submittedCsrfToken);

    // Validate CSRF token
    if (!storedCsrfToken || (await storedCsrfToken) !== submittedCsrfToken) {
      return {
        errors: {
          csrf: [
            "Invalid or expired form submission. Please refresh and try again.",
          ],
        },
        message:
          "Security validation failed. Please refresh the page and try again.",
      };
    }

    // Get client IP and user agent for security logging
    const ip =
      headers().get("x-forwarded-for") || headers().get("x-real-ip") || "";
    const userAgent = headers().get("user-agent") || "";

    // Apply rate limiting to prevent brute force attacks
    const email = formData.get("email")?.toString() || "";
    const rateLimitResult = await rateLimit(`login:${email}:${ip}`, 5, 60 * 15); // 5 attempts per 15 minutes

    if (!rateLimitResult.success) {
      await logAuthAttempt({
        email,
        success: false,
        ip,
        userAgent,
        reason: "Rate limit exceeded",
      });

      return {
        message: "Too many login attempts. Please try again later.",
      };
    }

    // Validate form fields
    const validatedFields = LoginFormSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      csrf: submittedCsrfToken,
    });

    // If form validation fails, return errors
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please correct the errors in the form.",
      };
    }

    const { email: validatedEmail, password } = validatedFields.data;

    try {
      // Get user from database
      const user = await getUserByEmail(validatedEmail);

      // Check if user exists
      if (!user) {
        // Log failed login attempt
        await logAuthAttempt({
          email: validatedEmail,
          success: false,
          ip,
          userAgent,
          reason: "User not found",
        });

        // Use a generic error message to prevent user enumeration
        return {
          message: "Invalid email or password.",
        };
      }

      // Verify password
      const passwordValid = await verifyPassword(password, user.password);
      if (!passwordValid) {
        // Log failed login attempt
        await logAuthAttempt({
          email: validatedEmail,
          success: false,
          ip,
          userAgent,
          reason: "Invalid password",
        });

        return {
          message: "Invalid email or password.",
        };
      }

      // Revoke all existing refresh tokens for this user (optional security measure)
      // This forces logout on all other devices when a new login occurs
      // Comment this out if you want to allow multiple active sessions
      // await revokeAllUserTokens(user.id);

      // Create session
      await createSession({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      // Log successful login
      await logAuthAttempt({
        email: validatedEmail,
        success: true,
        ip,
        userAgent,
      });

      return {
        success: true,
        message: "Login successful",
      };
    } catch (error: any) {
      console.error("Login error:", error);

      // Log error
      await logAuthAttempt({
        email: validatedEmail,
        success: false,
        ip,
        userAgent,
        reason: error.message,
      });
      // After successful validation
      return {
        success: true,
        message: "Login successful",
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    // On errors
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function logout() {
  // Destroy the session (revoke refresh token and clear cookies)
  await destroySession();

  // Redirect to home page
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
  };
}
