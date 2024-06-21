import { handlePost } from "@/lib/actions";

import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductsByCategoryFromDb,
  fetchAllProductFromDb,
  fetchProductsByNameFromDb,
  fetchProductsByBrandFromDb,
  fetchProductsByPriceRangeFromDb,
  fetchProductsByDiscountRangeFromDb,
  fetchProductsByStatusFromDb,
} from "@/lib/data";

function validateParams(params: Record<string, string | null>): boolean {
  const { minPrice, maxPrice, minDiscount, maxDiscount } = params;

  const isPositiveNumber = (value: string | null): boolean => {
    if (value === null) return true;
    const number = Number(value);
    return !isNaN(number) && number >= 0;
  };

  if (minPrice && !isPositiveNumber(minPrice)) return false;
  if (maxPrice && !isPositiveNumber(maxPrice)) return false;
  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) return false;

  if (minDiscount && !isPositiveNumber(minDiscount)) return false;
  if (maxDiscount && !isPositiveNumber(maxDiscount)) return false;
  if (minDiscount && maxDiscount && Number(minDiscount) > Number(maxDiscount))
    return false;

  return true;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const name = url.searchParams.get("name");
  const brand = url.searchParams.get("brand");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const minDiscount = url.searchParams.get("minDiscount");
  const maxDiscount = url.searchParams.get("maxDiscount");
  const status = url.searchParams.get("status");

  const params = {
    category,
    name,
    brand,
    minPrice,
    maxPrice,
    minDiscount,
    maxDiscount,
    status,
  };

  if (!validateParams(params)) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    let products;

    if (name) {
      products = await fetchProductsByNameFromDb(name);
    } else if (category) {
      products = await fetchProductsByCategoryFromDb(category);
    } else if (brand) {
      products = await fetchProductsByBrandFromDb(brand);
    } else if (minPrice && maxPrice) {
      products = await fetchProductsByPriceRangeFromDb(
        Number(minPrice),
        Number(maxPrice)
      );
    } else if (minDiscount && maxDiscount) {
      products = await fetchProductsByDiscountRangeFromDb(
        Number(minDiscount),
        Number(maxDiscount)
      );
    } else if (status) {
      products = await fetchProductsByStatusFromDb(status);
    } else {
      products = await fetchAllProductFromDb();
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
