import { NextRequest, NextResponse } from "next/server";
import { fetchUniqueTags } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    // Fetch unique tags from the database
    const uniqueTags = await fetchUniqueTags();

    // Return the tags as a JSON response
    const response = NextResponse.json(uniqueTags);

    response.headers.set(
      "Access-Control-Allow-Origin",
      "http://localhost:3001"
    ); // Allow requests from your frontend
    return response;
  } catch (error) {
    console.error("Error fetching unique tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch unique tags" },
      { status: 500 }
    );
  }
}
