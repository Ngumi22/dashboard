"use server";

import { z } from "zod";
import { createSession, deleteSession } from "./sessions";
import { dbOperation } from "@/lib/MysqlDB/dbOperations";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // Perform database operation
  const dbResult = await dbOperation(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT staff_id, email, password_hash, is_verified FROM staff_accounts WHERE email = ?`,
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      // ✅ Prevent email enumeration attacks (generic error)
      return {
        errors: {
          email: ["Invalid email or password"],
          password: ["Invalid email or password"],
        },
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return {
        errors: {
          email: ["Invalid email or password"],
          password: ["Invalid email or password"],
        },
      };
    }

    await createSession(user.staff_id);
    return { success: true };
  });

  // Handle response from database operation
  if (dbResult.errors) {
    return dbResult;
  }

  // Return success status
  return { success: true };
}
export async function logout() {
  await deleteSession();
  redirect("/login");
}
