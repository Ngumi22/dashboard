import { handlePost } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductsByCategoryFromDb,
  fetchAllProductFromDb,
} from "@/lib/data";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  try {
    if (category) {
      const products = await fetchProductsByCategoryFromDb(category);
      return NextResponse.json(products, { status: 200 });
    } else {
      const products = await fetchAllProductFromDb();
      return NextResponse.json(products, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
