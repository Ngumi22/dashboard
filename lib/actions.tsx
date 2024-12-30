"use server";

import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { signUpSchema } from "./utils";
import { getConnection } from "./db";
import bcrypt from "bcryptjs";
import {
  createSession,
  createVerificationToken,
  deleteSession,
} from "./sessions";
import { FormState, LoginFormSchema } from "./definitions";
import { sendVerificationEmail } from "./emailVerification";

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

export async function logout() {
  deleteSession();
}
