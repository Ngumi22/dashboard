"use client";

import { useStore } from "@/app/store";
import Base64Image from "@/components/Data-Table/base64-image";
import ProductForm from "@/components/Product/Create/product-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export interface Supplier {
  supplier_id?: number;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone_number?: string;
  supplier_location?: string;
  isNew?: boolean;
}

export interface Product {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_description: string;
  product_price: number;
  product_quantity: number;
  product_discount: number;
  product_status: "draft" | "pending" | "approved";
  tags: string[];
  main_image: File | null;
  thumbnails: File[];
  brand_id: string;
  brand_name: string;
  brand_image: File | null;
  category_id: string;
  category_name: string;
  suppliers: Supplier[];
  specifications: {
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
}

export default function UpdateProduct({ params }: { params: { id: string } }) {
  const fetchProduct = useStore((state) => state.fetchProductById);
  const product = useStore((state) => state.selectedProduct);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const router = useRouter();

  useEffect(() => {
    fetchProduct(params.id);
  }, [fetchProduct, params.id]);

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button
          onClick={() => router.push("/dashboard/categories")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <p>Product not found.</p>
        <button
          onClick={() => router.push("/dashboard/categories")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <ProductForm
      initialData={{
        product_id: Number(product.product_id),
        product_name: product.name,
        product_price: product.price,
        product_sku: product.sku,
        product_discount: product.discount,
        product_quantity: product.quantity,
        product_description: product.description,
        product_status: product.status,
        specifications: product.specifications,
        tags: product.tags,
        main_image: product.images.mainImage
          ? new File([product.images.mainImage], "main_image")
          : null,
        suppliers: product?.supplier?.map((supplier: any) => ({
          supplier_name: supplier,
        })),
      }}
    />
  );
}
