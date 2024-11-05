import { NextRequest, NextResponse } from "next/server";
import { fetchFilteredProductsFromDb } from "@/lib/Data/product";
import sharp from "sharp";
import type { SearchParams, Product } from "@/lib/Data/product";

type ProductStatus = "draft" | "pending" | "approved";

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: ProductStatus;
  description: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  images: {
    mainImage: string | null;
    thumbnails: (string | null)[];
  };
  tags: string[];
}

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

/**
 * Helper to safely parse number query parameters.
 */
function parseQueryParam(param: string | null): number | undefined {
  return param ? Number(param) : undefined;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const currentPage = parseQueryParam(url.searchParams.get("page")) || 1;

  const filter: SearchParams = {
    status: url.searchParams.get("status") || undefined,
    category: url.searchParams.get("category") || undefined,
    brand: url.searchParams.get("brand") || undefined,
    tags: url.searchParams.get("tags") || undefined,
    minPrice: parseQueryParam(url.searchParams.get("minPrice")),
    maxPrice: parseQueryParam(url.searchParams.get("maxPrice")),
    minDiscount: parseQueryParam(url.searchParams.get("minDiscount")),
    maxDiscount: parseQueryParam(url.searchParams.get("maxDiscount")),
    name: url.searchParams.get("name") || undefined,
  };

  try {
    const { products, errorMessage } = await fetchFilteredProductsFromDb(
      currentPage,
      filter
    );

    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    // Compress and convert image Buffers to Base64 strings for client-side compatibility
    const formattedProducts: ProductResponse[] = await Promise.all(
      products.map(async (product) => ({
        ...product,
        images: {
          mainImage: await compressAndEncodeBase64(product.images.mainImage),
          thumbnails: await Promise.all(
            product.images.thumbnails.map((thumb) =>
              compressAndEncodeBase64(thumb)
            )
          ),
        },
      }))
    );

    const response = NextResponse.json({
      products: formattedProducts,
    });
    response.headers.set(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
