import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductByIdFromDb,
  handlePut,
  handleDelete,
  fetchProductsByCategoryFromDb,
} from "@/lib/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const product = await fetchProductByIdFromDb(id);
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Check if ID is provided
  if (!id) {
    return NextResponse.json({ error: "ID not provided" }, { status: 400 });
  }

  try {
    // Call handlePut function to update the product
    const product = await handlePut(req, id);
    return product;
  } catch (error) {
    console.error("Error Updating product:", error);
    // Return 500 Internal Server Error if there's an error
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    // Call handleDelete with the id parameter
    const product = await handleDelete(req, id);
    return product;
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
