import {
  fetchByTag,
  fetchFilteredProductsFromDb,
  fetchProductsByBrandFromDb,
  fetchUniqueBrands,
} from "@/lib/Data/product";
import { NextRequest, NextResponse } from "next/server";

// Helper function to convert buffer data to Base64 format
function bufferToBase64(bufferData: any, mimeType = "image/png") {
  const base64String = bufferData.toString("base64");
  return `data:${mimeType};base64,${base64String}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const currentPage = Number(url.searchParams.get("page")) || 1;
  const brandsParam = url.searchParams.get("brand");
  const tag = url.searchParams.get("tag");
  const status = url.searchParams.get("status");
  const categories = url.searchParams.get("categories");

  // Construct filter object
  const filter: Record<string, string | null> = {};
  if (status) filter["status"] = status;
  if (categories) filter["categories"] = categories;

  try {
    let products;

    if (tag) {
      // Fetch products by tag if "tag" query parameter is provided
      products = await fetchByTag(tag);

      if (products.length === 0) {
        return NextResponse.json(
          { error: "No products found for this tag" },
          { status: 404 }
        );
      }
    } else if (brandsParam === "all") {
      // Fetch products grouped by each brand
      const uniqueBrands = await fetchUniqueBrands();
      const productsByBrand = await Promise.all(
        uniqueBrands.map(async (brand) => {
          const brandProducts = await fetchProductsByBrandFromDb(brand);
          return { brand, products: brandProducts };
        })
      );
      products = productsByBrand;
    } else {
      // Apply filters (like status and categories) if provided
      products = await fetchFilteredProductsFromDb(currentPage, filter);
    }

    // Cache-control header
    const response = NextResponse.json(products);
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
