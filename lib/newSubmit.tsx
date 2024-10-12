"use server";

import { productSchema } from "./ZodSchema";

export type FormState = {
  message: string;
  fields?: Record<string, any>;
  issues?: string[];
};

export async function addProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    return {
      message: "Invalid form data",
      fields: data,
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  // If validation succeeds, log the data and return success message
  console.log("Validated product data:", parsed.data);

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return { message: "Product added successfully" };
}
