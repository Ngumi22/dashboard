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

  // Log the raw form data
  console.log("Raw form data:", formData);

  // Parse tags and supplier safely, with logging
  let tags = [];
  let supplier = null;

  try {
    tags = formData.tags ? JSON.parse(formData.tags) : [];
  } catch (e) {
    console.error("Error parsing tags:", e);
  }

  try {
    // Correcting the structure: we directly access the supplier without the extra nesting
    const parsedSupplier = formData.supplier
      ? JSON.parse(formData.supplier)
      : null;
    supplier = parsedSupplier ? parsedSupplier.supplier : null; // Extract `supplier` directly
    console.log("Parsed supplier:", supplier);
  } catch (e) {
    console.error("Error parsing supplier:", e);
  }

  // Combine parsed values with other form data for validation
  const productData = {
    ...formData,
    tags,
    supplier, // No nesting, just pass the supplier object directly
  };

  // Log the structured product data before validation
  console.log("Structured product data:", productData);

  // Validate data using Zod schema
  const parsed = schema.safeParse(productData);

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
