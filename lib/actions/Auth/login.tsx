"use server";

import { FieldPacket, RowDataPacket } from "mysql2/promise";

import bcrypt from "bcryptjs";
import { FormState, LoginFormSchema } from "@/lib/definitions";
import { getConnection } from "@/lib/db";
import { createSession } from "@/lib/sessions";

export async function login(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const connection = await getConnection();

  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const errorMessage = { errors: { server: ["Invalid login credentials."] } };
  const userNotFoundError = { errors: { server: ["User not found."] } };

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const email = validatedFields.data.email;

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
      `SELECT id, email, password, is_verified FROM users WHERE email = ?`,
      [email]
    );

    const user = rows[0];

    if (!user) {
      return userNotFoundError;
    }

    if (!user.is_verified) {
      return {
        errors: { server: ["Please verify your email before logging in."] },
      };
    }

    const passwordMatch = await bcrypt.compare(
      validatedFields.data.password,
      user.password
    );

    if (!passwordMatch) {
      return errorMessage;
    }

    const userId = user.id.toString();
    const sessionToken = await createSession(userId);

    return {
      success: true,
      message: "Login successful!",
      sessionToken,
    };
  } catch (error) {
    return { errors: { server: ["An error occurred during login."] } };
  } finally {
    connection.release();
  }
}
