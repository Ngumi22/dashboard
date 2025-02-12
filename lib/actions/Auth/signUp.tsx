"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { serverSignupFormSchema } from "@/lib/ZodSchemas/signUpSchema";
import bcrypt from "bcryptjs";
import { fileToBuffer } from "@/lib/utils";
import { getIpAddress, rateLimiter } from "@/lib/rateLimiter";
import validator from "validator";

export type FormState = {
  message: string;
  fields?: Record<string, string | File>;
  issues?: string[];
};

// Validate CSRF token (mock implementation)
// async function validateCsrfToken(token: string | null): Promise<boolean> {
//   return token === "valid-csrf-token"; // Replace with actual CSRF validation logic
// }

export async function onSubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const csrfToken = data.get("csrfToken");
  // const validCsrfToken = await validateCsrfToken(csrfToken as string);
  // if (!validCsrfToken) {
  //   return {
  //     message: "Invalid CSRF token.",
  //     fields: Object.fromEntries(
  //       [...data.entries()].map(([key, value]) => [
  //         key,
  //         value instanceof File ? "[Uploaded File]" : value,
  //       ])
  //     ),
  //     issues: [],
  //   };
  // }

  const ip = getIpAddress();
  if (rateLimiter(ip, 5, 15 * 60 * 1000)) {
    return {
      message: "Too many requests. Please try again later.",
      fields: Object.fromEntries(
        [...data.entries()].map(([key, value]) => [
          key,
          value instanceof File ? "[Uploaded File]" : value,
        ])
      ),
      issues: [],
    };
  }

  const formData = Object.fromEntries(data.entries());
  const parsed = serverSignupFormSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      message: "Invalid form data",
      fields: Object.fromEntries(
        [...data.entries()].map(([key, value]) => [
          key,
          value instanceof File ? "[Uploaded File]" : value,
        ])
      ),
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const { first_name, last_name, role, email, phone_number, password } =
    parsed.data;
  const image = data.get("image") as File | null;

  const sanitizedFirstName = validator.escape(first_name);
  const sanitizedLastName = validator.escape(last_name);
  const sanitizedEmail = validator.normalizeEmail(email) || "";
  const sanitizedPhoneNumber = validator.escape(phone_number || "");

  let imagePath = null;
  if (image) {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxFileSize = 5 * 1024 * 1024;

    if (!allowedMimeTypes.includes(image.type)) {
      return {
        message: "Invalid image type. Only JPEG, PNG, and GIF are allowed.",
        fields: Object.fromEntries(
          [...data.entries()].map(([key, value]) => [
            key,
            value instanceof File ? "[Uploaded File]" : value,
          ])
        ),
        issues: [],
      };
    }

    if (image.size > maxFileSize) {
      return {
        message: "Image size must be less than 5MB.",
        fields: Object.fromEntries(
          [...data.entries()].map(([key, value]) => [
            key,
            value instanceof File ? "[Uploaded File]" : value,
          ])
        ),
        issues: [],
      };
    }

    imagePath = (await fileToBuffer(image)).toString("base64"); //Ensure it's serializable
  }

  try {
    return await dbOperation(async (connection) => {
      const [existingUser] = await connection.query(
        "SELECT * FROM staff_accounts WHERE email = ?",
        [sanitizedEmail]
      );

      const existingUserData = existingUser.map((user: any) => ({ ...user })); // Convert to plain objects

      if (existingUserData.length > 0) {
        return {
          message: "Email is already in use.",
          fields: Object.fromEntries(
            [...data.entries()].map(([key, value]) => [
              key,
              value instanceof File ? "[Uploaded File]" : value,
            ])
          ),
          issues: [],
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.query(
        "INSERT INTO staff_accounts (first_name, last_name, role, image, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          sanitizedFirstName,
          sanitizedLastName,
          role,
          imagePath,
          sanitizedEmail,
          sanitizedPhoneNumber,
          hashedPassword,
        ]
      );

      await connection.commit();

      return {
        message: "Signup successful",
        fields: {},
        issues: [],
      };
    });
  } catch (error: any) {
    console.error("Error during account creation", { error: error.message });
    return {
      message: "An error occurred during account creation",
      fields: Object.fromEntries(
        [...data.entries()].map(([key, value]) => [
          key,
          value instanceof File ? "[Uploaded File]" : value,
        ])
      ),
      issues: [error.message || "Unexpected error occurred"],
    };
  }
}
