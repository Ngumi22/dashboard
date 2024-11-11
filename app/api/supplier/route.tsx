import { getUniqueSuppliers } from "@/lib/Data/product";
import { NextResponse } from "next/server";

export async function GET(res: NextResponse) {
  try {
    const suppliers = await getUniqueSuppliers();

    const res = NextResponse.json({
      suppliers,
    });

    res.headers.set("Cache-Control", "s-maxage=3600, stale-while-revalidate");

    return res;
  } catch (error) {
    console.log(error);
  }
}
