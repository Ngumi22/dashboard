"use client";

import { useState, useEffect } from "react";
import UploadForm from "@/components/UploadForm";

export default function EditPage({ id }: { id: string }) {
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const product = await res.json();
          setProductData(product);
        } else {
          throw new Error("Failed to fetch product");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  return (
    <>
      {productData && (
        <UploadForm
          productData={productData}
          onSubmit={function (data: FormData): Promise<void> {
            throw new Error("Function not implemented.");
          }}
        />
      )}
    </>
  );
}
