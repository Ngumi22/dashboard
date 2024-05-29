import { NextRequest, NextResponse } from "next/server";
import { fetchProductByIdFromDb, handlePut, handleDelete } from "@/lib/actions";

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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Check if ID is provided
  if (!id) {
    return NextResponse.json({ error: "ID not provided" }, { status: 400 });
  }

  try {
    // Call handlePut function to update the product
    const product = await handlePut(request, id);
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    // Return 500 Internal Server Error if there's an error
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
