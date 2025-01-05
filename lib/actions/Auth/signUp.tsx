"use server";

import { RowDataPacket } from "mysql2/promise";

import bcrypt from "bcryptjs";
import { FormState } from "@/lib/definitions";
import { getConnection } from "@/lib/db";
import { signUpSchema } from "@/lib/utils";
import { createVerificationToken } from "@/lib/sessions";
import { sendVerificationEmail } from "@/lib/emailVerification";

export async function signUp(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const connection = await getConnection();
  const validatedFields = signUpSchema.safeParse({
    first_name: formData.get("first_name")?.toString() ?? "",
    last_name: formData.get("last_name")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    password1: formData.get("password1")?.toString() ?? "",
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { first_name, last_name, role, email, password } = validatedFields.data;

  try {
    await connection.beginTransaction();

    const [existingUserRows] = await connection.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUserRows.length > 0) {
      await connection.rollback();
      return { errors: { email: ["Email is already in use."] } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query<RowDataPacket[]>(
      "INSERT INTO users (first_name, last_name, role, email, password) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, role, email, hashedPassword]
    );

    const userId = (userResult as any).insertId;
    const verificationToken = await createVerificationToken(userId);

    await sendVerificationEmail(email, verificationToken);
    await connection.commit();

    return {
      success: true,
      message:
        "User signed up successfully. A verification email has been sent.",
    };
  } catch (error) {
    await connection.rollback();
    return {
      errors: {
        server: ["An error occurred while signing up. Please try again."],
      },
    };
  } finally {
    connection.release();
  }
}
