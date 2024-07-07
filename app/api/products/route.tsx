import { NextRequest, NextResponse } from "next/server";
import {
  fetchFilteredProductsFromDb,
  fetchBrandsFromDb,
  searchProducts,
} from "@/lib/data";
import validateParams from "@/lib/utils";
import { ProductFilter } from "@/lib/definitions";
import { handlePost } from "@/lib/actions";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filter: ProductFilter = {
    minPrice: url.searchParams.has("minPrice")
      ? parseFloat(url.searchParams.get("minPrice") as string)
      : undefined,
    maxPrice: url.searchParams.has("maxPrice")
      ? parseFloat(url.searchParams.get("maxPrice") as string)
      : undefined,
    minDiscount: url.searchParams.has("minDiscount")
      ? parseFloat(url.searchParams.get("minDiscount") as string)
      : undefined,
    maxDiscount: url.searchParams.has("maxDiscount")
      ? parseFloat(url.searchParams.get("maxDiscount") as string)
      : undefined,
    name: url.searchParams.get("name") || undefined,
    brand: url.searchParams.get("brand") || undefined,
    category: url.searchParams.get("category") || undefined,
    status: url.searchParams.get("status") || undefined,
  };
  const currentPage = Number(url.searchParams.get("page")) || 1;

  const params: Record<string, string | null> = {
    category: url.searchParams.get("category"),
    name: url.searchParams.get("name"),
    brand: url.searchParams.get("brand"),
    minPrice: url.searchParams.get("minPrice"),
    maxPrice: url.searchParams.get("maxPrice"),
    minDiscount: url.searchParams.get("minDiscount"),
    maxDiscount: url.searchParams.get("maxDiscount"),
    status: url.searchParams.get("status"),
    brands: url.searchParams.get("brands"),
  };

  if (!validateParams(params)) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    let products;

    if (params.brands) {
      products = await fetchBrandsFromDb();
    } else if (filter.name) {
      // Use searchProducts for name search
      products = await searchProducts(filter);
    } else {
      // Use fetchFilteredProductsFromDb for other filters
      products = await fetchFilteredProductsFromDb(currentPage, filter);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to get products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
