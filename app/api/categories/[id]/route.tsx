import { NextRequest, NextResponse } from "next/server";
import {
  fetchCategoryByIdFromDb,
  handleCategoryDelete,
  handleCategoryPut,
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
    const category = await fetchCategoryByIdFromDb(id);
    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    // Call handlePut function to update the category
    const category = await handleCategoryPut(req, id);
    return category;
  } catch (error) {
    console.error("Error Updating category:", error);
    // Return 500 Internal Server Error if there's an error
    return NextResponse.json(
      { error: "Failed to update category" },
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
    const category = await handleCategoryDelete(req, id);
    return category;
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
