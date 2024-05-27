"use client";

import { useState, useEffect } from "react";
import ProductForm from "@/components/add-form";

export default function CreatePage({ id }: { id: string }) {
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const product = await res.json();
          setProductData(product);
        } else {
          setProductData(null);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setProductData(null);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        console.log("Form submitted successfully!");
      } else {
        console.error("Failed to submit form:", res.statusText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <div>Add Product</div>
      <ProductForm onSubmit={handleSubmit} productData={productData} />
    </>
  );
}
