"use client";

import { useStore } from "@/app/store";
import Base64Image from "@/components/Data-Table/base64-image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddVariants({ params }: { params: { id: string } }) {
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
          Back to Categories
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
      <h1 className="text-2xl font-bold">{product.name}</h1>
      {product.images.mainImage && (
        <Base64Image
          src={product.images.mainImage}
          alt={product.name}
          width={200}
          height={200}
        />
      )}
      <p className="mt-4">
        <strong>Description:</strong> {product.description}
      </p>
      <p className="mt-2">
        <strong>Status:</strong>{" "}
        <span
          className={`px-2 py-1 rounded ${
            product.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
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
