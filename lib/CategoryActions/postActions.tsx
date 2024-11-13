"use server";
import { addCategory } from "../product_actions";
import { CategorySchema } from "../ZodSchemas/categorySchema";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function CategorySubmitAction(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  const formData = Object.fromEntries(data);
  console.log("Raw formData: ", formData);

  // Validate form data using CategorySchema
  const parsed = CategorySchema.safeParse(formData);
  console.log("Parsed: ", parsed);
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

  console.log("success: ", parsed);

  try {
    // Call addCategory to insert or retrieve existing category
    const categoryResponse = await addCategory(data);
    const categoryResult = await categoryResponse.json();

    if (categoryResponse.ok) {
      return {
        message: categoryResult.message,
        fields: {
          category_name: parsed.data.category_name,
          category_description: parsed.data.category_description,
        },
      };
    } else {
      // Handle case when addCategory reports a problem
      return {
        message: categoryResult.message || "Failed to add category",
        issues: categoryResult.issues || [],
      };
    }
  } catch (error) {
    console.error("Error in CategorySubmitAction:", error);
    return {
      message: "An error occurred while submitting the category",
      issues: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}
