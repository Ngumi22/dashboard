import { fetchProducts } from "@/lib/actions/Product/fetch";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const currentPage = 1; // Example current page
  const filter = {}; // Example filter object
  const products = await fetchProducts(currentPage, filter);
  return new Response(JSON.stringify(products), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
