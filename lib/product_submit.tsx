"use server";

import { schema } from "./formSchema";
import { z } from "zod";

export type FormState = {
  message: string;
  issues?: string[];
};

function parseJsonField(formData: Record<string, any>, key: string): any {
  if (formData[key]) {
    try {
      return JSON.parse(formData[key]);
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      throw new Error(`Failed to parse ${key} data.`);
    }
  }
  return undefined;
}

function parseNumberField(
  formData: Record<string, any>,
  key: string
): number | undefined {
  if (formData[key]) {
    const value = Number(formData[key]);
    if (isNaN(value)) {
      throw new Error(`Invalid ${key} data: not a number.`);
    }
    return value;
  }
  return undefined;
}

export async function ProductSubmit(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData: Record<string, any> = Object.fromEntries(data);

  try {
    // Parse JSON fields
    [
      "images",
      "specificationData",
      "supplier",
      "tags",
      "brand",
      "category",
    ].forEach((field) => {
      formData[field] = parseJsonField(formData, field);
    });

    // Parse number fields
    ["price", "quantity", "discount"].forEach((field) => {
      formData[field] = parseNumberField(formData, field);
    });

    console.log("Parsed product data:", formData);

    // Validate data using Zod schema
    const parsed = schema.parse(formData);

    console.log("Validation successful:", parsed);
    return { message: "Product Added Successfully" };
  } catch (error) {
    console.error("Error processing form data:", error);

    if (error instanceof z.ZodError) {
      return {
        message: "Invalid form data",
        issues: error.issues.map((issue) => issue.message),
      };
    }

    return {
      message: "Error processing form data",
      issues: [error instanceof Error ? error.message : String(error)],
    };
  }
}
