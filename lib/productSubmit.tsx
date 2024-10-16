"use server";

import { NewProductSchema } from "./ProductSchema";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

// Helper function for parsing numeric fields from FormData
function parseNumberField(formData: FormData, key: string): number | undefined {
  const value = formData.get(key);
  if (typeof value === "string") {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new Error(`Invalid ${key} data: not a number.`);
    }
    return parsedValue;
  }
  return undefined;
}

export async function SubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData: Record<string, any> = Object.fromEntries(data);

  // Extract and add the tags
  const tags = Object.keys(formData)
    .filter((key) => key.startsWith("tags.") && key.endsWith(".value"))
    .map((key) => ({ value: formData[key].toString() }));

  formData["tags"] = tags;

  // Ensure thumbnails are appended correctly as an array of files
  const thumbnails = data.getAll("thumbnails") as File[];
  formData["thumbnails"] = thumbnails.length > 0 ? thumbnails : [];

  // Extract suppliers as an array of objects
  const suppliers = Object.keys(formData)
    .filter((key) => key.startsWith("suppliers["))
    .map((key) => JSON.parse(formData[key].toString()));

  formData["suppliers"] = suppliers.length > 0 ? suppliers : [];

  // Extract specifications as an array of objects
  const specifications = Object.keys(formData)
    .filter((key) => key.startsWith("specifications["))
    .map((key) => JSON.parse(formData[key].toString()));

  formData["specifications"] = specifications.length > 0 ? specifications : [];

  // Zod validation and processing
  const parsed = NewProductSchema.safeParse(formData);

  if (parsed.success) {
    console.log("Parsed Data:", parsed.data);
  } else {
    console.log("Validation Errors:", parsed.error.issues);
  }

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

  return { message: "Product added successfully" };
}
