"use client";

import { useState, useEffect } from "react";
import UploadForm from "@/components/UploadForm";

export default function Upload({ id }: { id: string }) {
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories`);
        if (res.ok) {
          const product = await res.json();
          setProductData(product);
        } else {
          throw new Error("Failed to fetch category");
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    fetchCategory();
  }, []);

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
      {productData && (
        <UploadForm onSubmit={handleSubmit} productData={productData} />
      )}
    </>
  );
}
