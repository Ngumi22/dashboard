"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import ProductForm from "@/components/add-form";
import { useRouter } from "next/navigation";

export default function EditPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id;
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/products/${id}`);
          if (res.ok) {
            const product = await res.json();
            product.main_image = `data:image/jpeg;base64,${product.images.main}`;
            product.thumbnails = product.images.thumbnails.map(
              (thumb: string) => `data:image/jpeg;base64,${thumb}`
            );
            setProductData(product);
          } else {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch product");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setError(
            error instanceof Error ? error.message : "An unknown error occurred"
          );
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to fetch product",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
        } finally {
          setLoading(false);
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

        router.push("/dashboard/products");
      } else {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update product",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      {productData ? (
        <ProductForm
          initialData={productData}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      ) : (
        <p>No product data available</p>
      )}
    </>
  );
}
