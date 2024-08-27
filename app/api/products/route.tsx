import { handlePost } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductsByBrandFromDb,
  fetchFilteredProductsFromDb,
  fetchUniqueBrands,
} from "@/lib/data";
import validateParams from "@/lib/utils";
import { Product } from "@/lib/definitions";

export async function POST(request: NextRequest) {
  return handlePost(request);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const currentPage = Number(url.searchParams.get("page")) || 1;
  const brandsParam = url.searchParams.get("brands");

  // Convert SearchParams to Record
  const filter: Record<string, string | null> = {};
  url.searchParams.forEach((value, key) => {
    if (key !== "brands") {
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
    if (brandsParam === "all") {
      // Fetch all unique brands
      const uniqueBrands = await fetchUniqueBrands();

      // Fetch products for each brand
      const productsByBrand = await Promise.all(
        uniqueBrands.map(async (brand) => {
          const products = await fetchProductsByBrandFromDb(brand);
          return { brand, products };
        })
      );

      // Set Cache-Control header
      const response = NextResponse.json(productsByBrand);
      response.headers.set(
        "Cache-Control",
        "s-maxage=3600, stale-while-revalidate"
      );
      return response;
    } else {
      // Fetch filtered products based on other parameters
      const products = await fetchFilteredProductsFromDb(currentPage, filter);

      // Set Cache-Control header
      const response = NextResponse.json(products);
      response.headers.set(
        "Cache-Control",
        "s-maxage=3600, stale-while-revalidate"
      );
      return response;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to get products" },
      { status: 500 }
    );
  }
}
