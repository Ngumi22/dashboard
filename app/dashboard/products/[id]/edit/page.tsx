"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import ProductForm from "@/components/add-form";
import { fetchProductByIdFromDb } from "@/lib/actions";

export default function EditPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [productData, setProductData] = useState<any>(null);
  const id = params.id;

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/products/${id}`);
          if (res.ok) {
            const product = await res.json();
            // Ensure product data is a plain object
            setProductData(JSON.parse(JSON.stringify(product)));
          } else {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch product");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          if (error instanceof Error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to fetch product",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "An unknown error occurred",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            });
          }
        }
      };

      fetchProduct();
    }
  }, [id, toast]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        toast({
          title: "Product Updated",
          description: "Product updated successfully!",
        });
      } else {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update product",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unknown error occurred",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    }
  };

  return (
    <>
      <h1>Edit Product</h1>
      {productData ? (
        <ProductForm
          initialData={productData}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
