import { NextRequest, NextResponse } from "next/server";
import {
  deleteCategory,
  fetchCategoryByIdFromDb,
} from "@/lib/CategoryActions/fetchActions";
import sharp from "sharp";
import { updateCategoryAction } from "@/lib/CategoryActions/postActions";

// Compress image utility
async function compressAndEncodeBase64(
  buffer: Buffer | null
): Promise<string | null> {
  if (!buffer) return null;

  try {
    const compressedBuffer = await sharp(buffer)
      .resize(100) // Resize to 100px width
      .webp({ quality: 70 }) // Convert to WebP with 70% quality
      .toBuffer();

    return compressedBuffer.toString("base64");
  } catch (error) {
    console.error("Image compression error:", error);
    return null;
  }
}

// GET handler
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const category = await fetchCategoryByIdFromDb(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const compressedImage = await compressAndEncodeBase64(
      category.category_image
    );

    return NextResponse.json({
      category_id: category.category_id,
      category_name: category.category_name,
      category_description: category.category_description,
      status: category.status,
      compressedCategoryImage: compressedImage,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    // Parse the request body to get the updated data
    const body = await req.json();

    // Call updateCategory with the ID and updated data
    const response = await updateCategoryAction(id, body);

    return response;
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
    const category = await deleteCategory(id);
    return category;
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
