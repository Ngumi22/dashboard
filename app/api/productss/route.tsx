import { NextRequest, NextResponse } from "next/server";
import { fetchFilteredProductsFromDb } from "@/lib/Data/product";
import sharp from "sharp";
import type { SearchParams, Product } from "@/lib/Data/product";

export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  category: string;
  status: string;
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

  const compressedBuffer = await sharp(buffer)
    .resize(100) // Resize to 100px width (adjust as needed)
    .webp({ quality: 70 }) // Convert to WebP with 70% quality
    .toBuffer();

  return compressedBuffer.toString("base64");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // Pagination
  const currentPage = Number(url.searchParams.get("page")) || 1;

  // Individual search filters from query params
  const filter: SearchParams = {
    status: url.searchParams.has("status")
      ? Number(url.searchParams.get("status"))
      : undefined,
    category: url.searchParams.get("category") || undefined,
    brand: url.searchParams.get("brand") || undefined,
    tags: url.searchParams.get("tags") || undefined,
    minPrice: url.searchParams.has("minPrice")
      ? Number(url.searchParams.get("minPrice"))
      : undefined,
    maxPrice: url.searchParams.has("maxPrice")
      ? Number(url.searchParams.get("maxPrice"))
      : undefined,
    minDiscount: url.searchParams.has("minDiscount")
      ? Number(url.searchParams.get("minDiscount"))
      : undefined,
    maxDiscount: url.searchParams.has("maxDiscount")
      ? Number(url.searchParams.get("maxDiscount"))
      : undefined,
    name: url.searchParams.get("name") || undefined,
  };

  try {
    const {
      products,
      uniqueTags,
      uniqueCategories,
      uniqueBrands,
      errorMessage,
    } = await fetchFilteredProductsFromDb(currentPage, filter);

    // Compress and convert image Buffers to Base64 strings for client-side compatibility
    const formattedProducts: ProductResponse[] = await Promise.all(
      products.map(async (product) => ({
        ...product,
        images: {
          mainImage: await compressAndEncodeBase64(product.images.mainImage),
          thumbnails: await Promise.all(
            product.images.thumbnails.map(compressAndEncodeBase64)
          ),
        },
      }))
    );

    if (errorMessage) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    // Response structure with caching
    const response = NextResponse.json({
      products: formattedProducts,
      uniqueTags,
      uniqueCategories,
      uniqueBrands,
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
