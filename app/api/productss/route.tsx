import { dbOperation } from "@/lib/product_actions";

export async function GET(req: Request) {
  try {
    // Fetch all products ordered by id in ascending order
    return dbOperation(async (connection) => {
      const [products] = await connection.query(
        `
        SELECT
            p.product_id,
            p.product_name,
            p.product_sku,
            p.product_description,
            p.product_price,
            p.product_discount,
            p.product_quantity,
            p.product_status,
            b.brand_name,
            c.category_name,
            sup.supplier_name,
            GROUP_CONCAT(DISTINCT CONCAT(spec.specification_name, ': ', ps.value) ORDER BY spec.specification_name SEPARATOR ', ') AS specifications,
            GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name SEPARATOR ', ') AS tags
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN product_suppliers psup ON p.product_id = psup.product_id
        LEFT JOIN suppliers sup ON psup.supplier_id = sup.supplier_id
        LEFT JOIN product_specifications ps ON p.product_id = ps.product_id
        LEFT JOIN specifications spec ON ps.specification_id = spec.specification_id
        LEFT JOIN product_tags pt ON p.product_id = pt.product_id
        LEFT JOIN tags t ON pt.tag_id = t.tag_id
        GROUP BY p.product_id, b.brand_name, c.category_name, sup.supplier_name
        ORDER BY p.product_id;
        `
      );

      // Return the products data as a JSON response
      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
