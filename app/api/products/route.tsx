import { handlePost } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductsByBrandFromDb,
  fetchFilteredProductsFromDb,
  fetchUniqueBrands,
  fetchByTag,
} from "@/lib/data";
import validateParams from "@/lib/utils";

export async function POST(request: NextRequest) {
  return handlePost(request);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const currentPage = Number(url.searchParams.get("page")) || 1;
  const brandsParam = url.searchParams.get("brands");
  const tag = url.searchParams.get("tag"); // Get "tag" from query parameters

  // Convert other query parameters to filters
  const filter: Record<string, string | null> = {};
  url.searchParams.forEach((value, key) => {
    if (key !== "brands" && key !== "tag") {
      filter[key] = value;
    }
  });

  // Validate filter parameters
  if (!validateParams(filter)) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    let products;

    if (tag) {
      // Fetch products by tag if provided
      products = await fetchByTag(tag);

      // If no products found for the tag, return 404
      if (products.length === 0) {
        return NextResponse.json(
          { error: "No products found for this tag" },
          { status: 404 }
        );
      }
    } else if (brandsParam === "all") {
      // Fetch products by all brands if "brands=all" is provided
      const uniqueBrands = await fetchUniqueBrands();
      const productsByBrand = await Promise.all(
        uniqueBrands.map(async (brand) => {
          const brandProducts = await fetchProductsByBrandFromDb(brand);
          return { brand, products: brandProducts };
        })
      );
      products = productsByBrand;
    } else {
      // Fetch filtered products if no tag or brand is provided
      products = await fetchFilteredProductsFromDb(currentPage, filter);
    }

    // Set cache-control header and return the response
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
