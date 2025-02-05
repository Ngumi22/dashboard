"use client";

import { useStore } from "@/app/store";
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
  const fetchProduct = useStore((state) => state.fetchProductByIdState);
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

  // Map the fetched product data to the initialData object
  const initialData = {
    product_id: Number(product.product_id),
    product_name: product.name,
    product_sku: product.sku,
    product_description: product.description,
    product_price: product.price,
    product_discount: product.discount,
    product_quantity: product.quantity,
    product_status: product.status,

    tags: product.tags || [],
    main_image: product.images?.mainImage
      ? new File([product.images.mainImage], "main_image")
      : null,
    thumbnails: [
      product.images?.thumbnail1
        ? new File([product.images.thumbnail1], "thumbnail1")
        : null,
      product.images?.thumbnail2
        ? new File([product.images.thumbnail2], "thumbnail2")
        : null,
      product.images?.thumbnail3
        ? new File([product.images.thumbnail3], "thumbnail3")
        : null,
      product.images?.thumbnail4
        ? new File([product.images.thumbnail4], "thumbnail4")
        : null,
      product.images?.thumbnail5
        ? new File([product.images.thumbnail5], "thumbnail5")
        : null,
    ].filter(Boolean) as File[], // Filter out null values and cast to File[]
    suppliers: product.supplier?.map((supplier: any) => ({
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name,
      supplier_email: supplier.supplier_email,
      supplier_phone_number: supplier.supplier_phone_number,
      supplier_location: supplier.supplier_location,
    })),
    specifications: product.specifications?.map((spec: any) => ({
      specification_name: spec.specification_name,
      specification_value: spec.value,
      category_id: spec.category_id,
    })),
  };

  return <ProductForm initialData={initialData} />;
}
