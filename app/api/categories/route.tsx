import { query } from "@/lib/db";

export async function GET(req: any, res: any) {
  try {
    const categories = await query("SELECT * FROM categories", res);
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      {
        status: 500,
      }
    );
  }
}
