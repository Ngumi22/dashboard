import { getUniqueCategories } from "@/lib/CategoryActions/fetchActions";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Define the Category type
type Category = {
  category_id: string;
  category_name: string;
  category_image: Buffer | null;
  category_description: string;
  status: "active" | "inactive";
};

async function compressAndEncodeBase64(
  buffer: Buffer | null
): Promise<string | null> {
  if (!buffer) return null;

  try {
    const compressedBuffer = await sharp(buffer)
      .resize(100) // Resize to 100px width (adjust as needed)
      .webp({ quality: 70 }) // Convert to WebP with 70% quality
      .toBuffer();

    return compressedBuffer.toString("base64");
  } catch (error) {
    console.error("Image compression error:", error);
    return null;
  }
}

/**
 * Handles GET requests to fetch and format categories.
 * @param req - The incoming NextRequest object.
 * @returns The response containing formatted category data.
 */
export async function GET(req: NextRequest) {
  try {
    const cats = await getUniqueCategories();

    // Compress and convert image Buffers to Base64 strings for client-side compatibility
    const formattedCategories = await Promise.all(
      cats.map(async (cat: Category) => ({
        category_id: cat.category_id,
        category_name: cat.category_name,
        category_description: cat.category_description,
        status: cat.status,
        category_image: await compressAndEncodeBase64(cat.category_image),
      }))
    );

    const response = NextResponse.json({
      categories: formattedCategories,
    });
    response.headers.set(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
