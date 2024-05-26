import { NextRequest, NextResponse } from "next/server";
import { handlePut, handleDelete, fetchProductByIdFromDb } from "@/lib/actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "", 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Product ID is required and must be a number" },
      { status: 400 }
    );
  }
  return fetchProductByIdFromDb(id);
}

export async function PUT(request: NextRequest) {
  return handlePut(request);
}

export async function DELETE(request: NextRequest) {
  return handleDelete(request);
}
