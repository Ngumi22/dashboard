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

  // Parse the images field if it exists
  if (formData.images) {
    try {
      formData.images = JSON.parse(formData.images); // Parse the JSON string back into an object
    } catch (error) {
      console.error("Error parsing images:", error);
      return {
        message: "Invalid images data",
        issues: ["Failed to parse images data."],
      };
    }
  }

  // Parse the images field if it exists
  if (formData.price) {
    try {
      formData.price = Number(formData.price); // Parse the JSON string back into an object
    } catch (error) {
      console.error("Error parsing price:", error);
      return {
        message: "Invalid price data",
        issues: ["Failed to parse price data."],
      };
    }
  }

  // Parse the images field if it exists
  if (formData.quantity) {
    try {
      formData.quantity = Number(formData.quantity); // Parse the JSON string back into an object
    } catch (error) {
      console.error("Error parsing quantity:", error);
      return {
        message: "Invalid quantity data",
        issues: ["Failed to parse quantity data."],
      };
    }
  }

  // Parse the images field if it exists
  if (formData.discount) {
    try {
      formData.discount = Number(formData.discount); // Parse the JSON string back into an object
    } catch (error) {
      console.error("Error parsing discount:", error);
      return {
        message: "Invalid discount data",
        issues: ["Failed to parse discount data."],
      };
    }
  }

  // Parse the images field if it exists
  if (formData.specificationData) {
    try {
      formData.specificationData = JSON.parse(formData.specificationData); // Parse the JSON string back into an object
    } catch (error) {
      console.error("Error parsing specificationData:", error);
      return {
        message: "Invalid specificationData data",
        issues: ["Failed to parse specificationData data."],
      };
    }
  }

  // Parse the images field if it exists
  if (formData.tags) {
    try {
      formData.tags = JSON.parse(formData.tags); // Parse the JSON string back into an object
    } catch (error) {
      console.error("Error parsing tags:", error);
      return {
        message: "Invalid tags data",
        issues: ["Failed to parse tags data."],
      };
    }
  }

  // Log the structured product data after parsing images
  console.log("Parsed product data:", formData);

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
