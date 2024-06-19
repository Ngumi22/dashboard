"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ProductData } from "@/lib/definitions";

export default function ProductPage() {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) {
            throw new Error("Failed to fetch product");
          }
          const data = await res.json();
          setProduct(data);
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
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Single Product</p>
      <div>
        <ul>
          <li key={product.id} className="my-5">
            <h2>{product.name}</h2>
            <p>SKU: {product.sku}</p>
            <p>Price: {product.price}</p>
            <p>Quantity: {product.quantity}</p>
            <p>Discount: {product.discount}</p>
            <p>Description: {product.description}</p>
            <p>Brand: {product.brand}</p>
            <p>Category: {product.category}</p>
            <p>Status: {product.status}</p>
            <div>
              {product.images.main && (
                <img
                  className="h-24 w-24"
                  src={`data:image/jpeg;base64,${product.images.main}`}
                  alt="Main Image"
                />
              )}
            </div>
            <div className="flex gap-2">
              {product.images.thumbnails.map((thumbnail, index) => (
                <img
                  className="h-20 w-20"
                  key={index}
                  src={`data:image/jpeg;base64,${thumbnail}`}
                  alt={`Thumbnail ${index + 1}`}
                />
              ))}
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
