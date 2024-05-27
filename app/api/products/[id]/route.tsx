import { NextRequest, NextResponse } from "next/server";
import { handlePut, handleDelete, fetchProductByIdFromDb } from "@/lib/actions";

export async function GET(request: NextRequest) {
  const id = parseInt(request.nextUrl.pathname.split("/").pop() || "", 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Product ID is required and must be a number" },
      { status: 400 }
    );
  }
  return fetchProductByIdFromDb(id);
}

export async function PUT(request: NextRequest) {
  const id = parseInt(request.nextUrl.pathname.split("/").pop() || "", 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Product ID is required and must be a number" },
      { status: 400 }
    );
  }
  return handlePut(request, id);
}

export async function DELETE(request: NextRequest) {
  const id = parseInt(request.nextUrl.pathname.split("/").pop() || "", 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Product ID is required and must be a number" },
      { status: 400 }
    );
  }
  return handleDelete(request, id);
}
