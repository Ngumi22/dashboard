import { getUniqueSuppliers } from "@/lib/Data/product";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
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
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
