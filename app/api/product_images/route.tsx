import { query } from "@/lib/db";

export async function GET(req: any, res: any) {
  try {
    const images = await query("SELECT * FROM images", res);
    return new Response(JSON.stringify(images), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
      status: 500,
    });
  }
}
