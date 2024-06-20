// pages/api/categories/[name].ts

import { NextRequest, NextResponse } from "next/server";
import { handleCategoryDelete } from "@/lib/actions";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const { name } = params;

  try {
    const response = await handleCategoryDelete(req, name);
    return response;
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
