import { handlePost } from "@/lib/actions";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchProductsByCategoryFromDb,
  fetchAllProductsFromDb,
  fetchProductsByNameFromDb,
  fetchProductsByBrandFromDb,
  fetchProductsByPriceRangeFromDb,
  fetchProductsByDiscountRangeFromDb,
  fetchProductsByStatusFromDb,
  fetchFilteredProductsFromDb,
  fetchBrandsFromDb, // Import the new function
} from "@/lib/data";

import validateParams from "@/lib/utils";
import { ProductFilter } from "@/lib/definitions";

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
  const currentPage = Number(url.searchParams.get("page")) || 1;
  const brands = url.searchParams.get("brands"); // Add this line

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
    brands: url.searchParams.get("brands") || undefined,
  };

  const params = {
    category,
    name,
    brand,
    minPrice,
    maxPrice,
    minDiscount,
    maxDiscount,
    status,
    brands,
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
        Number(maxDiscount),
        Number(currentPage)
      );
    } else if (status) {
      products = await fetchProductsByStatusFromDb(status);
    } else if (brands) {
      const brandsWithProducts = await fetchBrandsFromDb();
      const brandsData = await Promise.all(
        brandsWithProducts.map(async (brand) => ({
          brand,
          products: await fetchProductsByBrandFromDb(brand),
        }))
      );
      return NextResponse.json(brandsData);
    } else if (filter) {
      products = await fetchFilteredProductsFromDb(currentPage, filter);
      return NextResponse.json(products);
    } else {
      products = await fetchAllProductsFromDb(currentPage);
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
