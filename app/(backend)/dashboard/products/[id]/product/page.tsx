"use client";

import { useStore } from "@/app/store";
import Base64Image from "@/components/Data-Table/base64-image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { fetchProductById } from "@/lib/actions/Product/fetchById";

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
  main_image: string;
  thumbnails: {
    thumbnail1: string;
    thumbnail2: string;
    thumbnail3: string;
    thumbnail4: string;
    thumbnail5: string;
  }[];
  category_id: string;
  brand: {
    brand_id: string;
    brand_name: string;
    brand_image: string;
  };
  specifications: {
    specification_name: string;
    specification_value: string;
    category_id: string;
  }[];
  suppliers: {
    supplier_id?: number;
    supplier_name?: string;
    supplier_email?: string;
    supplier_phone_number?: string;
    supplier_location?: string;
    isNew?: boolean;
  }[];
}

export default function ProductDetails() {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  const id = Array.isArray(params.id)
    ? Number(params.id[0])
    : Number(params.id);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetchProductById(id);

          setProduct(res);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch product",
          });
        }
      };

      fetchProduct();
    }
  }, [id, toast]);

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button
          onClick={() => router.push("/dashboard/products")}
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
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">{product.product_name}</h1>
      {product.main_image && (
        <Base64Image
          src={product.main_image}
          alt={product.product_name}
          width={200}
          height={200}
        />
      )}
      <p className="mt-4">
        <strong>Description:</strong> {product.product_description}
      </p>
      <p className="mt-2">
        <strong>Status:</strong>{" "}
        <span
          className={`px-2 py-1 rounded ${
            product.product_status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
          {product.product_status.charAt(0).toUpperCase() +
            product.product_status.slice(1)}
        </span>
      </p>
      <button
        onClick={() => router.push("/dashboard/products")}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded">
        Back to Products
      </button>
    </div>
  );
}
