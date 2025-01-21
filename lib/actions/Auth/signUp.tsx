"use server";

import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import { serverSignupFormSchema } from "@/lib/ZodSchemas/signUpSchema";
import bcrypt from "bcryptjs";
import { fileToBuffer } from "@/lib/utils";

import { getIpAddress, rateLimiter } from "@/lib/rateLimiter"; // Rate limiter utility

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function onSubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  // Get the client's IP address
  const ip = getIpAddress(); // Function to get IP
  const limit = 5; // Max 5 requests
  const windowMs = 15 * 60 * 1000; // 15 minutes

  // Apply rate limiting
  const rateLimitResponse = rateLimiter(ip, limit, windowMs);
  if (rateLimitResponse) {
    return {
      message: "Too many requests. Please try again later.",
      fields: Object.fromEntries(
        Array.from(data.entries()).map(([key, value]) => [
          key,
          value.toString(),
        ])
      ),
      issues: [],
    };
  }

  // Parse and validate form data
  const formData = Object.fromEntries(data);
  const parsed = serverSignupFormSchema.safeParse(formData);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const key of Object.keys(formData)) {
      fields[key] = formData[key].toString();
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const { first_name, last_name, role, email, phone_number, password } =
    parsed.data;

  const image = data.get("image") as File | null;

  let imagePath = null;
  if (image) {
    imagePath = await fileToBuffer(image);
  }

  return dbOperation(async (connection) => {
    try {
      // Check for existing user
      const [existingUser] = await connection.query(
        "SELECT * FROM staff_accounts WHERE email = ?",
        [email]
      );
      if (existingUser.length > 0) {
        throw new Error("Email is already in use.");
      }

      // Hash password and process image
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into database
      const [userResult] = await connection.query(
        "INSERT INTO staff_accounts (first_name, last_name, role, image, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          first_name,
          last_name,
          role,
          imagePath,
          email,
          phone_number,
          hashedPassword,
        ]
      );

      await connection.commit();

      return {
        userId: userResult.insertId,
        message: "Account created successfully",
      };
    } catch (error: any) {
      return {
        message: "An error occurred during account creation",
        fields: {},
        issues: [],
      };
    } finally {
      connection.release();
    }
  });
}
