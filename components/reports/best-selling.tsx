import { generateBestSellingProductsReport } from "@/lib/reports";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default async function BestSellingProductsReportPage() {
  // Fetch the data directly in the server component
  const products = await generateBestSellingProductsReport();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Best Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.map((product) => (
          <div key={product.id}>
            <div>{product.name}</div>
            <div>{product.sku}</div>
            <div>{product.brand}</div>
            <div>{product.price}</div>
            <div>{product.quantity}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
