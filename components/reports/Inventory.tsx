import React from "react";
import { GetServerSideProps } from "next";
import { generateInventoryReport } from "@/lib/reports";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {products.map((product) => (
          <div key={product.product_id}>
            <div>{product.name}</div>
            <div>{product.sku}</div>
            <div>{product.quantity}</div>
            <div>{product.stock_level}</div>
          </div>
        ))}
      </CardContent>
    </Card>
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
