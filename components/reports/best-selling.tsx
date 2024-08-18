import React from "react";
import { GetServerSideProps } from "next"; // Import the function that fetches the report data from the database
import { generateBestSellingProductsReport } from "@/lib/reports";

interface Product {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  brand: string;
  total_sold: number;
}

interface BestSellingProductsReportProps {
  products: Product[];
}

export default function BestSellingProductsReport({
  products,
}: BestSellingProductsReportProps) {
  return (
    <div>
      <h2>Best Selling Products</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Brand</th>
            <th>Total Sold</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.brand}</td>
              <td>{product.total_sold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await generateBestSellingProductsReport(); // Fetch the data directly from the database
  return {
    props: {
      products,
    },
  };
};
