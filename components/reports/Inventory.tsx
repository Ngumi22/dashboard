import React from "react";
import { GetServerSideProps } from "next";
import { generateInventoryReport } from "@/lib/reports";

interface InventoryProduct {
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  stock_level: number;
}

interface InventoryReportProps {
  products: InventoryProduct[];
}

export default function InventoryReport({ products }: InventoryReportProps) {
  return (
    <div>
      <h2>Inventory Report</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Stock Level</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.quantity}</td>
              <td>{product.stock_level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await generateInventoryReport(); // Fetch the data directly from the database
  return {
    props: {
      products,
    },
  };
};
