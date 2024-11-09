import { NextResponse } from "next/server";
import { getCategorySpecs } from "@/lib/Data/product";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Retrieve `categoryName` from query parameters
    const url = new URL(request.url);
    const categoryName = url.searchParams.get("categoryName");

    if (!categoryName) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Pass `categoryName` to `getCategorySpecs`
    const specs = await getCategorySpecs(categoryName);

    // If no specs are found, return an empty array
    if (!specs) {
      return NextResponse.json(
        { specs: [] }, // Return an empty array if no specifications are found
        { status: 200 }
      );
    }

    // Return the specs in the response with appropriate caching headers
    const response = NextResponse.json({
      specs,
    });

    response.headers.set(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error fetching category specs:", error);
    return NextResponse.json(
      { error: "Error fetching category specs" },
      { status: 500 }
    );
  }
}
