import { z } from "zod";
import { NextResponse } from "next/server";
import { getCategorySpecs } from "@/lib/actions/Category/fetch";
// Define a schema that supports multiple ID formats
const categoryIdSchema = z.union([
  z.string().uuid(), // UUID format
  z.string().regex(/^\d+$/, { message: "Category ID must be numeric" }), // Numeric ID
  z.string().min(1, { message: "Category ID cannot be empty" }), // General fallback for non-empty string
]);

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");

    // Validate categoryId
    const validCategoryId = categoryIdSchema.parse(categoryId);

    // Retrieve specifications
    const specs = await getCategorySpecs(validCategoryId);

    // Return specs or an empty array with caching
    return NextResponse.json(
      { specs: specs || [] },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" } }
    );
  } catch (error) {
    console.error("Error fetching category specs:", error);

    // Handle validation errors and unexpected errors separately
    const status = error instanceof z.ZodError ? 400 : 500;
    const errorMessage =
      error instanceof z.ZodError
        ? error.errors.map((err) => err.message).join(", ")
        : "Internal Server Error";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
