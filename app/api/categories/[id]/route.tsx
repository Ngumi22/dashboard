import { NextRequest, NextResponse } from "next/server";
import {
  fetchCategoryByIdFromDb,
  handleCategoryDelete,
  handleCategoryPut,
} from "@/lib/actions";

// GET category by ID or fetch products by category name
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    if (id) {
      const category = await fetchCategoryByIdFromDb(id);
      return category;
    } else {
      console.error("Error fetching categories");
    }
  } catch (error) {
    console.error("Error fetching category or products:", error);
    return NextResponse.json(
      { error: "Failed to fetch category or products" },
      { status: 500 }
    );
  }
}

// PUT update category by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ID not provided" }, { status: 400 });
  }

  try {
    const category = await handleCategoryPut(req, id);
    return category;
  } catch (error) {
    console.error("Error Updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
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
