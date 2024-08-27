import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Fetch all images from the images table
    const images = await query("SELECT * FROM images");
    return new Response(JSON.stringify(images), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
      status: 500,
    });
  }
}
