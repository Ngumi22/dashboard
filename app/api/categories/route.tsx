import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // No parameters needed for this query
    const categories = await query("SELECT * FROM categories ORDER BY id ASC");
    return new Response(JSON.stringify(categories), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      { status: 500 }
    );
  }
}
