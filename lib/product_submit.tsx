"use server";

import { schema } from "./formSchema";

// Define a simple type for the form state response
export type FormState = {
  message: string;
  issues?: string[];
};

// ProductSubmit function with logging
export async function ProductSubmit(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData: Record<string, any> = {};

  // Convert FormData to a plain object
  data.forEach((value, key) => {
    formData[key] = value;
  });

  // Log the structured product data before validation
  console.log("Structured product data:", formData);

  // Validate data using Zod schema
  const parsed = schema.safeParse(formData);

  // Log the validation result
  if (!parsed.success) {
    console.error("Validation failed:", parsed.error.issues);
    return {
      message: "Invalid form data",
      issues: parsed.error.issues.map((issue) => issue.message),
    };
  }

  console.log("Validation successful:", parsed.data);
  return { message: "Product Added Successfully" };
}
