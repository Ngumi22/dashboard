import { getConnection } from "@/lib/database";
import { FieldPacket, RowDataPacket } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Define the Category type with a correct property name
type Category = {
  category_name: string;
  category_image: Buffer | null; // Keep as Buffer, we will convert to Base64 later
  category_description: string;
};

/**
 * Compresses and converts an image buffer to a smaller Base64-encoded string.
 * @param buffer - The image buffer to compress and encode.
 * @returns A Base64 string of the compressed image, or null if the buffer is null.
 */
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

export async function GET(req: NextRequest) {
  const connection = await getConnection();

  try {
    // Correctly type the query result
    const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.query(
      "SELECT * FROM categories"
    );

    // Compress and convert image Buffers to Base64 strings for client-side compatibility
    const formattedCategories = await Promise.all(
      rows.map(async (cat) => ({
        category_name: cat.category_name,
        category_description: cat.category_description,
        // Use the correct property name here
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
