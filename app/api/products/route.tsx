import { handlePost } from "@/lib/actions";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

import { fetchAllProductFromDb } from "@/lib/actions";

export async function GET(req: NextRequest) {
  try {
    const products = await fetchAllProductFromDb();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
