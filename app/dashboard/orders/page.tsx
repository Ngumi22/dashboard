// components/ProductList.tsx
"use client";
import Link from "next/link";
import { ProductAdding } from "@/components/Product/productform";

export default function CategoryList() {
  return (
    <div className="p-4">
      <ProductAdding />
    </div>
  );
}
