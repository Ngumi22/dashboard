import { getUniqueSuppliers } from "@/lib/Data/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const suppliers = await getUniqueSuppliers();

    const response = NextResponse.json({
      suppliers,
    });

    response.headers.set(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate"
    );

    return response;
  } catch (error) {
    console.log(error);
  }
}
